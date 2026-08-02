import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';

async function bootstrap() {
  const app = await NestFactory.create(MessagesModule);

  // Global validation: every incoming body is validated against its DTO
  // before reaching the controller. NOTE: this lives in main.ts only, so it
  // is NOT active in the e2e test, which boots MessagesModule directly via
  // Test.createTestingModule.
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
