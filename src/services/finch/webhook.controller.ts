import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { Probot } from 'probot';
import { Request } from 'express';
import { WebhookEventName } from '@octokit/webhooks-types';

@Controller('hook')
export class WebhookController {
  constructor(
    @Inject('PROBOT')
    protected readonly probot: Probot,
  ) {
    //
  }

  @Post()
  async handleWebhook(@Req() request: Request & { customProperty: string }) {
    const id = request.headers['x-github-delivery'];
    if (id !== null && id !== undefined) {
      const name = request.headers['x-github-event'];
      if (name !== null && name !== undefined) {
        const signature =
          request.headers['x-hub-signature-256'] ||
          request.headers['x-hub-signature'];
        if (signature !== null && signature !== undefined) {
          const payload: string = request.body;
          if (payload !== null) {
            await this.probot.webhooks.verifyAndReceive({
              id: Array.isArray(id) ? id.join('|') : id,
              signature: Array.isArray(signature)
                ? signature.join('|')
                : signature,
              payload,
              name: name as WebhookEventName,
            });
          } else {
            throw new BadRequestException('Missing webhook request body');
          }
        } else {
          throw new BadRequestException('Missing x-github-signature header');
        }
      } else {
        throw new BadRequestException('Missing x-github-event header');
      }
    } else {
      throw new BadRequestException('Missing x-github-delivery header');
    }
  }
}
