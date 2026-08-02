import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthService } from './users/auth.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
// import { User } from './users/user.entity';
// import { Report } from './reports/report.entity';
const cookieSession = require('cookie-session');
// const dbConfig = require('../ormconfig');
import { dataSourceOptions } from '../db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // this will look for the configurations from eigher ormconfig or environment variables
    TypeOrmModule.forRoot(dataSourceOptions),
    // following code frag is usless when it comes to TyprOrm CLI
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       type: 'sqlite',
    //       database: config.get<string>('DB_NAME'),
    //       entities: [User, Report],
    //       // Entity class properties sync with the database table
    //       // not recommended to use this true in production
    //       // this will drop table columns in the database
    //       synchronize: true,
    //     }
    //   }
    // }),
    //   TypeOrmModule.forRoot({
    //     type: 'sqlite',
    //     database: 'db.sqlite',
    //     entities: [User, Report],
    //     synchronize: true,
    // }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // setup global pipeline
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // remove non existing attributes from the request compare with
        // DTO before pass to service
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  // Global middleware wiring lives here (not main.ts) so the e2e tests
  // create the app through AppModule and get the same pipeline.
  //
  // ORDER MATTERS: cookieSession must run BEFORE CurrentUserMiddleware
  // (registered in UsersModule) so req.session is parsed first — the
  // middleware reads session.userId to populate req.currentUser.
  //
  // cookie-session signs/parses a cookie via COOKIE_KEY; it stores the
  // payload (here just { userId }) on req.session.
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get<string>('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');
  }
}
