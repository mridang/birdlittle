import { Probot } from 'probot';
import { Injectable, Logger } from '@nestjs/common';
import CanaryService from './canary.service';
import Repository from './types';

@Injectable()
export default class ProbotHandler {
  constructor(private readonly canaryService: CanaryService) {
    //
  }

  init(): (p: Probot) => void {
    const canaryService: CanaryService = this.canaryService;
    return (app: Probot) => {
      const logger = new Logger(ProbotHandler.name);
      const regex: RegExp = /runs\/(\d+)\/deployment_protection_rule/;

      app.on('deployment_protection_rule.requested', async (context) => {
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
      });

      app.on('workflow_run.completed', async (context) => {
        const { id: installationId } = context.payload.installation ?? {
          id: NaN,
        };
        const { full_name: repoName } = context.payload.repository;
        const { id: runId, actor } = context.payload.workflow_run;

        if (actor.login === 'canary-for-github[bot]') {
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
    };
  }
}
