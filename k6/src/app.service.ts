import { Injectable } from '@nestjs/common';
import { SigninDto } from './dto';

// Service = business logic. Here it's a no-op passthrough: signin just echoes
// the body back so the k6 test can assert on a 200 response and response
// time. No real auth — the point is load-testing the pipeline, not the logic.
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  signin(body: SigninDto) {
    return body;
  }
}
