/**
 * @file Receives GitHub webhook deliveries, verifies their signature and hands them on.
 */
import {
  BadRequestException,
  Controller,
  Inject,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from '@mridang/nestjs-defaults';
import { WebhookEventName } from '@octokit/webhooks-types';
import { Webhooks } from '@octokit/webhooks';
import { setErrorContext } from '../../../utils/observability/context.js';
import { WebhookConfig, WebhookHandler } from './webhook.interfaces.js';
import type { RawBodyRequest } from '@nestjs/common';

/** One header value: a single string, or several when the header repeats. */
type HeaderValue = string | string[];

/**
 * Reads a request header case-insensitively across HTTP platforms. The Express
 * platform exposes `request.headers` as a plain lower-cased object, whereas the
 * Cloudflare adapter exposes a Fetch `Headers` instance accessed via `.get()`.
 * @param request - The incoming request whose headers are read.
 * @param name - The lower-case name of the header to read.
 * @returns The header value, or undefined when the header is absent.
 * @example
 * const delivery = getHeader(request, 'x-github-delivery');
 */
function getHeader(request: Request, name: string): HeaderValue | undefined {
  const headers: unknown = request.headers;
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  return request.headers[name];
}

/** A parsed webhook body as far as this file reads it, or `null` when it did not parse to a JSON object. */
type WebhookPayload = Readonly<Record<string, unknown>> | null;

/**
 * Tells whether a parsed JSON value is an object with named properties.
 * @param value - The value `JSON.parse` returned.
 * @returns True for a JSON object, false for arrays, `null` and primitives.
 * @example
 * isJsonObject({ id: 1 });
 */
function isJsonObject(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parses a webhook body, giving `null` when it is not valid JSON or not an object.
 * @param payload - The raw webhook body.
 * @returns The parsed object, or `null`.
 * @example
 * const parsed = parseWebhookPayload(rawBody);
 */
function parseWebhookPayload(payload: string): WebhookPayload {
  try {
    const value: unknown = JSON.parse(payload);
    return isJsonObject(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Reads the numeric id at `payload[key].id`, keeping only the number and never
 * anything else from the payload.
 * @param payload - The parsed webhook payload, or `null` when it failed to parse.
 * @param key - The payload property that holds the object with the id, such as `repository`.
 * @returns The numeric id, or undefined when the property or its id is missing or not a number.
 * @example
 * const repositoryId = numericId(parsed, 'repository');
 */
function numericId(payload: WebhookPayload, key: string): number | undefined {
  const entry = payload?.[key];
  if (typeof entry !== 'object' || entry === null || !('id' in entry)) {
    return undefined;
  }
  return typeof entry.id === 'number' ? entry.id : undefined;
}

/**
 * Puts the event, delivery and (numeric) ids on the span, so an error shows them.
 * @param event - The GitHub event name from the `x-github-event` header.
 * @param delivery - The delivery id from the `x-github-delivery` header.
 * @param payload - The raw webhook body, parsed here only to read the numeric ids.
 * @returns A promise that resolves once the context has been recorded.
 * @example
 * await setWebhookContext('push', 'a1b2c3', rawBody);
 */
async function setWebhookContext(
  event: string,
  delivery: string,
  payload: string,
): Promise<void> {
  const parsed = parseWebhookPayload(payload);
  await setErrorContext({
    'webhook.event': event,
    'webhook.delivery_id': delivery,
    'github.installation_id': numericId(parsed, 'installation'),
    'github.repository_id': numericId(parsed, 'repository'),
  });
}

@Controller('hook')
export class WebhookController {
  private readonly logger: Logger = new Logger(WebhookController.name);

  constructor(
    @Inject(WebhookConfig)
    readonly webhookConfig: WebhookConfig,
    @Inject(WebhookHandler)
    private readonly webhookHandler: WebhookHandler & { webhooks: Webhooks },
  ) {
    //
  }

  private static getPayload(request: Request): Promise<string> | null {
    if ('body' in request) {
      return typeof request.body === 'object' &&
        'rawBody' in request &&
        request.rawBody instanceof Buffer
        ? Promise.resolve(request.rawBody.toString('utf8'))
        : Promise.resolve(request.body);
    }
    return null;
  }

  @Post()
  async handleWebhook(@Req() request: RawBodyRequest<Request>) {
    const id = getHeader(request, 'x-github-delivery');
    if (id === undefined) {
      throw new BadRequestException('Missing x-github-delivery header');
    }
    const name = getHeader(request, 'x-github-event');
    if (name === undefined) {
      throw new BadRequestException('Missing x-github-event header');
    }
    const signature =
      [
        getHeader(request, 'x-hub-signature-256') ||
          getHeader(request, 'x-hub-signature') ||
          [],
      ]
        .flat()
        .join('|') || null;
    if (signature === null) {
      throw new BadRequestException('Missing x-hub-signature-256 header');
    }
    const payload = (await WebhookController.getPayload(request)) as
      string | null | undefined;
    if (payload === null || payload === undefined) {
      throw new BadRequestException('Missing webhook request body');
    }
    if (!(await this.webhookHandler.webhooks.verify(payload, signature))) {
      throw new BadRequestException('Invalid signature or payload');
    }
    const deliveryId = Array.isArray(id) ? id.join('|') : id;
    await setWebhookContext(String(name), deliveryId, payload);
    this.logger.log(`Received a webhook for event ${String(name)}`);
    await this.webhookHandler.webhooks.verifyAndReceive({
      id: deliveryId,
      signature,
      payload,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the event name is an arbitrary request header and @octokit/webhooks-types exports no runtime list of its names to check it against; verifyAndReceive reports an unknown event itself
      name: name as WebhookEventName,
    });
  }
}
