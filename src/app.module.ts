import { Global, Module } from '@nestjs/common';
import { secretName } from './constants.js';
import { DefaultsModule } from '@mridang/nestjs-defaults';
import { BirdlittleModule } from './services/birdlittle/birdlittle.module.js';
import { HomeController } from './home/home.controller.js';

@Global()
@Module({
  imports: [
    DefaultsModule.register({
      configName: secretName,
      // On Workers, config comes from the Worker env (populated into
      // process.env by nodejs_compat), never AWS Secrets Manager.
      secrets: {},
      assets: false,
      sentry: false,
    }),
    BirdlittleModule,
  ],
  controllers: [HomeController],
  providers: [
    //
  ],
  exports: [
    //
  ],
})
export class AppModule {
  //
}
