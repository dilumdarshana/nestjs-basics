import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWTRefreshStrategy } from './strategies/jwt.refresh.strategy';
import jwtRefreshConfig from './config/jwt.refresh.config';

@Module({
  imports: [
    // JWT access token configuration using nest config module
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRATION',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    // JWT refresh token configuration using nest config module
    ConfigModule.forFeature(jwtRefreshConfig),
  ],
  providers: [
    AuthService,
    PrismaService,
    UserService,
    JwtStrategy,
    JWTRefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
