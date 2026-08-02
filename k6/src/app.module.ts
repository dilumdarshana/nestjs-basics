import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Root module. Deliberately minimal: no imports, no DB, no validation — the
// app exists purely as a load-test target for Grafana k6. The two endpoints
// (GET / and POST /signin) are what the k6 script hammers.
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
