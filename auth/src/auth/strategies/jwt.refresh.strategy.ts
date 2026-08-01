import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt_payload';
import jwtRefreshConfig from '../config/jwt.refresh.config';

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private refreshTokenConfiguration: ConfigType<typeof jwtRefreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: refreshTokenConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  // when the JWT token is valid, then this function will be called
  validate(payload: JwtPayload) {
    const { sub: userId } = payload;

    return this.authService.validateRefreshToken(userId);
  }
}
