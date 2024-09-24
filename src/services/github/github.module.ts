import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OctokitModule } from './octokit/octokit.module';

@Module({
  controllers: [
    //
  ],
  providers: [
    //
  ],
  imports: [ConfigModule, OctokitModule],
  exports: [
    //
  ],
})
export class GithubModule {
  //
}
