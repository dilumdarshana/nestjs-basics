import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The app is a trivial hello/signin API — its only purpose is to be the
  // TARGET of the k6 load tests (see test/k6/load-test.spec.ts). Port comes
  // from PORT env or defaults to 3000, matching BASE_URL in the k6 script.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
