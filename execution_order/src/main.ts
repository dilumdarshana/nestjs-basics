import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipeline (relies on class-validator + class-transformer):
  // - whitelist: strips properties not declared in the DTO
  // - transform: converts the plain JSON body into a PostHelloDto instance
  // - skipMissingProperties: false -> missing required fields fail validation
  // This runs for every route, before the route-level MyPipe in the controller.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
