import { NestFactory } from '@nestjs/core';
import { ComputerModule } from './computer/computer.module';

async function bootstrap() {
  // Bootstraps the whole DI graph from the root module (ComputerModule).
  // Nest resolves every module import + provider/constructor dependency and
  // wires the singletons before the server starts listening.
  const app = await NestFactory.create(ComputerModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
