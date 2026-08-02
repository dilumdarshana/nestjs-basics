import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// const cookieSession = require('cookie-session');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Thin bootstrap: the global pipeline (cookie-session + CurrentUserMiddleware)
  // and ValidationPipe are configured in AppModule, NOT here. Why? So e2e tests
  // that create the app from AppModule get the same pipeline as production.
  // (See app.module.ts configure() + APP_PIPE provider.)
  // Note: moved this pipeline and middleware to the AppModule becz of e2e tests doen't work
  // app.use(cookieSession({
  //   keys: ['abcdef'],
  // }));
  // adding validation pipeline. This will intelligently apply when there is
  // validation DTO attached to the service

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     // remove non existing attributes from the request compare with
  //     // DTO before pass to service
  //     whitelist: true,
  //   }),
  // );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
