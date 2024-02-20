import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { secretName } from '../../constants';
import { createProbot } from 'probot';
import ProbotHandler from './probot.handler';
import GithubConfig from './github.config';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

@Module({
  controllers: [WebhookController],
  providers: [
    ProbotHandler,
    GithubConfig,
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
          return new Octokit({
            authStrategy: createAppAuth,
            auth: {
              appId: secret.appId,
              privateKey: secret.privateKey,
              installationId: installationId,
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
