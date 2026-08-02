import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // EventEmitterModule.forRoot() in AppModule boots the event bus alongside
  // the app, so listeners (@OnEvent) are registered before requests arrive.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
