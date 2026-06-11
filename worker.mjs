import { NestFactory } from '@nestjs/core';
import { AppModule } from './dist/app.module.js';
import { configure } from '@mridang/nestjs-defaults';
import { httpServerHandler } from 'cloudflare:node';

// Boot once at top level; configure() (winston logger + middleware) runs AFTER
// listen so winston never writes during the forbidden global scope.
const app = await NestFactory.create(AppModule, {
  rawBody: true,
  logger: false,
});
await app.listen(3000);
configure(app);

export default httpServerHandler({ port: 3000 });
