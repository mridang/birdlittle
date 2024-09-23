import { Global, Module } from '@nestjs/common';
import { secretName } from './constants';
import { DefaultsModule } from '@mridang/nestjs-defaults';
import { FinchModule } from './services/finch/finch.module';

@Global()
@Module({
  imports: [
    DefaultsModule.register({
      configName: secretName,
    }),
    FinchModule,
  ],
  controllers: [
    //
  ],
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
