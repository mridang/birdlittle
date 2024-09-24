import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { createProbot } from 'probot';
import ProbotHandler from './probot.handler';
import { Octokit } from '@octokit/rest';
import CanaryService from './canary.service';
import { retry } from '@octokit/plugin-retry';
import { ConfigService } from '@nestjs/config';
import { GithubModule } from '../github/github.module';
import { OctokitModule } from '../github/octokit/octokit.module';

const MyOctokit = Octokit.plugin(retry);

@Module({
  controllers: [WebhookController],
  providers: [
    CanaryService,
    ProbotHandler,
    {
      provide: 'WORKFLOW_NAME',
      useFactory: () => {
        return '.github/workflows/cypress.yml';
      },
    },
    {
      inject: [ConfigService, ProbotHandler],
      provide: 'PROBOT',
      useFactory: async (
        configService: ConfigService,
        probotHandler: ProbotHandler,
      ) => {
        const probot = createProbot({
          overrides: {
            secret: configService.getOrThrow('GITHUB_WEBHOOK_SECRET'),
            appId: configService.getOrThrow('GITHUB_APP_ID'),
            privateKey: configService
              .getOrThrow('GITHUB_PRIVATE_KEY')
              .replaceAll('&', '\n'),
          },
        });

        await probot.load(probotHandler.init());

        return probot;
      },
    },
  ],
  imports: [OctokitModule, GithubModule],
  exports: [
    //
  ],
})
export class FinchModule {
  //
}
