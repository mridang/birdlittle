import { Inject, Injectable, Logger } from '@nestjs/common';
import CanaryService from './canary.service';
import Repository from './types';
import { WebhookHandler } from '../github/webhook/webhook.interfaces';

@Injectable()
export default class ProbotHandler {
  constructor(
    readonly canaryService: CanaryService,
    @Inject(WebhookHandler)
    readonly webhookHandler: WebhookHandler,
  ) {
    const logger = new Logger(ProbotHandler.name);
    const regex: RegExp = /runs\/(\d+)\/deployment_protection_rule/;

    this.webhookHandler.on(
      'deployment_protection_rule.requested',
      async (context) => {
        const { id: installationId } = context.payload.installation ?? {
          id: NaN,
        };
        const { full_name: repoName } = context.payload.repository;
        const { id: deploymentId } = context.payload.deployment || { id: NaN };

        logger.log(
          `Running canary for deployment ${deploymentId} on ${repoName}`,
        );

        const match = context.payload.deployment_callback_url?.match(regex);
        logger.log(
          `Deployment #${deploymentId} has URL ${context.payload.deployment_callback_url}`,
        );
        if (!match || !match[1]) {
          throw new Error(`Unable to parse deployment id`);
        }

        const githubRepo = new Repository(repoName);
        await canaryService.runCanary(
          installationId,
          Number(match[1]),
          context.payload.environment || 'unknown',
          githubRepo.orgName,
          githubRepo.repoName,
        );
      },
    );

    this.webhookHandler.on('workflow_run.completed', async (context) => {
      const { id: installationId } = context.payload.installation ?? {
        id: NaN,
      };
      const { full_name: repoName } = context.payload.repository;
      const { id: runId, actor } = context.payload.workflow_run;

      if (actor.login === 'birdlittle[bot]') {
        logger.log(
          `Workflow #${runId} completed successfully for ${repoName}.`,
        );

        const githubRepo = new Repository(repoName);
        await canaryService.handleGate(
          installationId,
          runId,
          githubRepo.orgName,
          githubRepo.repoName,
          context.payload.workflow_run.conclusion === 'success'
            ? 'approved'
            : 'rejected',
        );
      } else {
        logger.log(
          `Ignoring workflow run ${runId} because it was triggered by ${actor.login}`,
        );
      }
    });
  }
}
