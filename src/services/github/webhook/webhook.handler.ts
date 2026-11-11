/**
 * @file Default webhook handler that registers GitHub event listeners with Octokit.
 */
import { EmitterWebhookEventName, Webhooks } from '@octokit/webhooks';
import { WebhookConfig, WebhookHandler } from './webhook.interfaces.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { HandlerFunction } from '@octokit/webhooks/types';

/**
 * Owns the Octokit webhook receiver and lets other services subscribe to events.
 */
@Injectable()
export class DefaultWebhookHandler implements WebhookHandler {
  private readonly logger = new Logger(DefaultWebhookHandler.name);
  readonly webhooks: Webhooks;

  constructor(@Inject(WebhookConfig) readonly webhookConfig: WebhookConfig) {
    this.webhooks = new Webhooks({ secret: webhookConfig.webhookSecret });
  }

  /**
   * Registers a listener for a GitHub webhook event and logs the registration.
   * @param event - The GitHub event name to listen for, such as `push`.
   * @param handler - The function to run each time that event is received.
   * @example
   * handler.on('installation', async ({ payload }) => { ... });
   */
  on<E extends EmitterWebhookEventName>(
    event: E,
    handler: HandlerFunction<E, unknown>,
  ) {
    this.logger.log(`Registered handler for ${event}`);
    this.webhooks.on(event, handler);
  }
}
