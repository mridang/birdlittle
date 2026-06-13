import { Global, Module } from '@nestjs/common';
import { DefaultsModule } from '@mridang/nestjs-defaults';
import { BirdlittleModule } from './services/birdlittle/birdlittle.module.js';
import { HomeController } from './home/home.controller.js';

@Global()
@Module({
  imports: [
    // On Workers, config comes from the Worker env (populated into process.env
    // by nodejs_compat), so the default env-backed secrets source is correct.
    DefaultsModule.register({
      assets: false,
      sentry: true,
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
