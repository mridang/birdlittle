import { configure } from '@mridang/nestjs-defaults';
import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  Logger,
  type Provider,
  type Type,
} from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

export class End2EndModule {
  app!: INestApplication;
  private readonly imports: Array<
    Type | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  private readonly controllers: Type[];
  private readonly providers: Provider[];

  constructor(options: {
    imports?: Array<
      Type | DynamicModule | Promise<DynamicModule> | ForwardReference
    >;
    providers?: Provider[];
    controllers?: Type[];
  }) {
    this.imports = options.imports ?? [];
    this.providers = options.providers ?? [];
    this.controllers = options.controllers ?? [];
  }

  async beforeAll(
    testFn: (testModule: TestingModuleBuilder) => TestingModuleBuilder = (
      testModule,
    ) => testModule,
  ): Promise<void> {
    // Disable Sentry in tests. When `SENTRY_DSN` is set, the nestjs-defaults
    // reporter dynamically imports `@sentry/node`, which is an optional dep
    // not installed for this Cloudflare Workers app. Clearing the DSN forces
    // the no-op reporter and avoids a jest resolution error.
    delete process.env.SENTRY_DSN;
    const moduleFixture = await testFn(
      Test.createTestingModule({
        controllers: [...this.controllers],
        imports: [...this.imports],
        providers: [...this.providers],
      }).setLogger(new Logger()), // See https://stackoverflow.com/questions/71677866/
    ).compile();

    const nestApp = moduleFixture.createNestApplication<NestExpressApplication>(
      {
        rawBody: true,
      },
    );

    configure(nestApp);
    await nestApp.init();
    this.app = nestApp;
  }

  async afterAll(): Promise<void> {
    await this.app.close();
  }
}
