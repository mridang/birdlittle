import { Module } from '@nestjs/common';
import CanaryService from './canary.service';
import { GithubModule } from '../github/github.module';
import { OctokitModule } from '../github/octokit/octokit.module';

@Module({
  controllers: [
    //
  ],
  providers: [
    CanaryService,
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
