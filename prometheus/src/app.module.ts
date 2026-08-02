import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Root module. PrometheusModule.register({ path: '/metrics' }) exposes a
// Prometheus text-format endpoint at GET /metrics that the Prometheus server
// scrapes. makeCounterProvider defines a Counter metric and registers it as a
// DI provider, so AppService can inject it via @InjectMetric.
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
