import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyMiddleware } from './app.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // Global middleware: runs FIRST in the request pipeline (before guards,
  // interceptors, pipes) for every route. This project exists to show that
  // pipeline order — see the console logs when POSTing to /.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MyMiddleware).forRoutes('*');
  }
}
