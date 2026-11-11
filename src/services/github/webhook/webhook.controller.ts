/**
 * @file Receives GitHub webhook deliveries, verifies their signature and hands them on.
 */
import {
  BadRequestException,
  Controller,
  Inject,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from '@mridang/nestjs-defaults';
import { WebhookEventName } from '@octokit/webhooks-types';
import { WebhookConfig, WebhookHandler } from './webhook.interfaces.js';
import { Webhooks } from '@octokit/webhooks';
import { setErrorContext } from '../../../utils/observability/context.js';

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
  const headers = request.headers as unknown as
    | { get?: (key: string) => string | null }
    | Record<string, HeaderValue | undefined>;
  const value =
    headers && typeof headers.get === 'function'
      ? headers.get(name)
      : (headers as Record<string, HeaderValue | undefined>)[name];
  return value ?? undefined;
}

/**
 * Reads the numeric id at `payload[key].id`, keeping only the number and never
 * anything else from the payload.
 * @param payload - The parsed webhook payload, or any value that failed to parse.
 * @param key - The payload property that holds the object with the id, such as `repository`.
 * @returns The numeric id, or undefined when the property or its id is missing or not a number.
 * @example
 * const repositoryId = numericId(parsed, 'repository');
 */
function numericId(payload: unknown, key: string): number | undefined {
  const value = (payload as Record<string, { id?: unknown } | undefined>)?.[key]
    ?.id;
  return typeof value === 'number' ? value : undefined;
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
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    parsed = null;
  }
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
    } else {
      return null;
    }
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
    this.logger.log(`Received a webhook for event ${name}`);
    await this.webhookHandler.webhooks.verifyAndReceive({
      id: deliveryId,
      signature: signature,
      payload,
      name: name as WebhookEventName,
    });
  }
}
