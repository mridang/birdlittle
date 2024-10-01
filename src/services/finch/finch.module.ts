import { Module } from '@nestjs/common';
import CanaryService from './canary.service';
import { GithubModule } from '../github/github.module';
import { OctokitModule } from '../github/octokit/octokit.module';
import ProbotHandler from './probot.handler';

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
