import { Module } from '@nestjs/common';
import CanaryService from './canary.service.js';
import { GithubModule } from '../github/github.module.js';
import { OctokitModule } from '../github/octokit/octokit.module.js';
import ProbotHandler from './probot.handler.js';

@Module({
  controllers: [
    //
  ],
  providers: [
    CanaryService,
    ProbotHandler,
    {
      provide: 'WORKFLOW_NAME',
      useFactory: () => {
        return '.github/workflows/cypress.yml';
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
