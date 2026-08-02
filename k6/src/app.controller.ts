import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SigninDto } from './dto';

// Controller = HTTP concerns. Both routes are the load-test targets:
//   - GET /        -> tagged `endpoint: hello` in the k6 script
//   - POST /signin -> tagged `endpoint: users` in the k6 script
// @HttpCode(200) overrides the default 201 for POST so the k6 check
// `status === 200` passes.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() body: SigninDto) {
    return this.appService.signin(body);
  }
}
