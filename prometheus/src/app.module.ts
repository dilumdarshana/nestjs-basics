import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrometheusModule.register({ path: '/metrics' })],
  controllers: [AppController],
  providers: [
    AppService,
    makeCounterProvider({
      name: 'get_hello_calls',
      help: 'Total number of getHello calls',
    }),
  ],
})
export class AppModule {}
