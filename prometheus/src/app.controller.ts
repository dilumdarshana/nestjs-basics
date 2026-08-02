import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Controller = HTTP concerns. GET / is the only app route; every call flows
// through AppService.getHello(), which increments the counter metric. The
// /metrics endpoint is provided by PrometheusModule (not defined here).
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
