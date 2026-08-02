import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

// Service = business logic. The Counter metric is injected by name
// ('get_hello_calls') — the provider was registered in app.module.ts via
// makeCounterProvider. `public` on the injected metric lets the spec test
// inspect it. counter.inc() increments the metric on every getHello() call,
// which Prometheus scrapes from /metrics.
@Injectable()
export class AppService {
  constructor(
    @InjectMetric('get_hello_calls') public counter: Counter<string>,
  ) {}

  getHello(): string {
    this.counter.inc();
    return 'Hello World!';
  }
}
