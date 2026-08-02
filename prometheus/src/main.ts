import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Port from PORT env or defaults to 3000. Prometheus scrapes this app at
  // /metrics (see prometheus.yml), so the app must be reachable from the
  // Prometheus container — on macOS that's via host.docker.internal:3000.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
