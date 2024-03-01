import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { secretName } from '../../constants';
import { createProbot } from 'probot';
import ProbotHandler from './probot.handler';
import GithubConfig from './github.config';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import CanaryService from './canary.service';
import { retry } from '@octokit/plugin-retry';

const MyOctokit = Octokit.plugin(retry);

@Module({
  controllers: [WebhookController],
  providers: [
    CanaryService,
    ProbotHandler,
    GithubConfig,
    {
      provide: 'WORKFLOW_NAME',
      useFactory: () => {
        return '.github/workflows/cypress.yml';
      },
    },
    {
      inject: [GithubConfig, ProbotHandler],
      provide: 'PROBOT',
      useFactory: async (
        githubConfig: GithubConfig,
        probotHandler: ProbotHandler,
      ) => {
        const secret = await githubConfig.getSecret(secretName);

        const probot = createProbot({
          overrides: {
            ...secret,
          },
        });

        await probot.load(probotHandler.init());

        return probot;
      },
    },
    {
      inject: [GithubConfig],
      provide: 'GITHUB_FN',
      useFactory: async (githubConfig: GithubConfig) => {
        const secret = await githubConfig.getSecret(secretName);

        return (installationId: number) => {
          return new MyOctokit({
            authStrategy: createAppAuth,
            auth: {
              appId: secret.appId,
              privateKey: secret.privateKey,
              installationId: installationId,
            },
            retry: {
              doNotRetry: ['429'],
            },
          });
        };
      },
    },
  ],
  exports: [
    //
  ],
})
export class FinchModule {
  //
}
