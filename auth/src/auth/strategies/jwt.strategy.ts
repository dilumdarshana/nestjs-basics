import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
// import jwtConfig from '../config/jwt.config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt_payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  // when the JWT token is valid, then this function will be called
  validate(payload: JwtPayload) {
    const { sub: userId } = payload;

    return this.authService.validateJwtUser(userId);
  }
}
