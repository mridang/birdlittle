import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OctokitModule } from './octokit/octokit.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  controllers: [
    //
  ],
  providers: [
    //
  ],
  imports: [
    ConfigModule,
    OctokitModule,
    WebhookModule.registerAsync({
      useFactory: async (configService: ConfigService, webhookHandler) => {
        return {
          webhookConfig: {
            webhookSecret: configService.getOrThrow('GITHUB_WEBHOOK_SECRET'),
          },
          webhookHandler,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [
    WebhookModule
  ],
})
export class GithubModule {
  //
}
