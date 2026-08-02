import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MyInterceptor } from './app.interceptor';
import { MyGuard } from './app.guard';
import { MyPipe } from './app.pipe';
import { PostHelloDto } from './app.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Demonstrates the execution-order pipeline on a single route. Request
  // lifecycle for POST /: middleware -> guard -> interceptor(before) ->
  // pipe(s) -> handler -> service -> interceptor(after). Watch the console
  // logs in that exact order.
  @UseGuards(MyGuard)
  @UseInterceptors(MyInterceptor)
  @UsePipes(MyPipe)
  @Post()
  postHello(@Body() data: PostHelloDto): PostHelloDto {
    console.log('Controller -> Hello');

    return this.appService.postHello(data);
  }
}
