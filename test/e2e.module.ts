/**
 * @file Builds a Nest application for end-to-end tests.
 */
import { configure } from '@mridang/nestjs-defaults';
import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  Logger,
  type Provider,
  type Type,
} from '@nestjs/common';
// eslint-disable-next-line n/no-unpublished-import -- devDependency used only by the test suite, never shipped
import { type NestExpressApplication } from '@nestjs/platform-express';
// eslint-disable-next-line n/no-unpublished-import -- devDependency used only by the test suite, never shipped
import { Test, TestingModuleBuilder } from '@nestjs/testing';

/** One entry in a Nest module's `imports` list. */
type ModuleImport =
  Type | DynamicModule | Promise<DynamicModule> | ForwardReference;

/**
 * Builds a Nest application for end-to-end tests and tears it down afterwards.
 */
export class End2EndModule {
  app!: INestApplication;
  private readonly imports: ModuleImport[];
  private readonly controllers: Type[];
  private readonly providers: Provider[];

  constructor(options: {
    imports?: ModuleImport[];
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
