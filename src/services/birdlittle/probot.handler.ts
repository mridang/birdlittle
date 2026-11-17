/**
 * @file Routes GitHub deployment and workflow events to the canary service.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookHandler } from '../github/webhook/webhook.interfaces.js';
import CanaryService from './canary.service.js';
import Repository from './types.js';

/** Matches the workflow run id in a deployment protection rule callback URL. */
const DEPLOYMENT_PROTECTION_RULE_PATTERN =
  /runs\/(\d+)\/deployment_protection_rule/u;

@Injectable()
export default class ProbotHandler {
  private readonly logger = new Logger(ProbotHandler.name);

  constructor(
    readonly canaryService: CanaryService,
    @Inject(WebhookHandler)
    readonly webhookHandler: WebhookHandler,
  ) {
    this.webhookHandler.on(
      'deployment_protection_rule.requested',
      async (context) => {
        const { id: installationId } = context.payload.installation ?? {
          id: Number.NaN,
        };
        const { full_name: repoName } = context.payload.repository;
        const { id: deploymentId } = context.payload.deployment ?? {
          id: Number.NaN,
        };

        this.logger.log(
          `Running canary for deployment ${deploymentId} on ${repoName}`,
        );

        const match = context.payload.deployment_callback_url?.match(
          DEPLOYMENT_PROTECTION_RULE_PATTERN,
        );
        this.logger.log(
          `Deployment #${deploymentId} has URL ${context.payload.deployment_callback_url}`,
        );
        if (!match?.[1]) {
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
        id: Number.NaN,
      };
      const { full_name: repoName } = context.payload.repository;
      const { id: runId, actor, conclusion } = context.payload.workflow_run;

      if (actor?.login === 'birdlittle[bot]') {
        this.logger.log(
          `Workflow #${runId} completed successfully for ${repoName}.`,
        );

        const githubRepo = new Repository(repoName);
        await canaryService.handleGate(
          installationId,
          runId,
          githubRepo.orgName,
          githubRepo.repoName,
          conclusion === 'success' ? 'approved' : 'rejected',
        );
      } else {
        this.logger.log(
          `Ignoring workflow run ${runId} because it was triggered by ${actor?.login}`,
        );
      }
    });
  }
}
