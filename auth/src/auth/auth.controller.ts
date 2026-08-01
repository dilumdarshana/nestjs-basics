import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninPayloadDto } from './dto/signin-payload.dto';
import { SignupPayloadDto } from './dto/signup-payload.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
// import { LocalAuthGuard } from '../auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Validate user and return the user if valid
   * @param body username and password
   * @returns user infor and access token
   */
  @Post('signin')
  // @UseGuards(LocalAuthGuard)
  signin(@Body() body: SigninPayloadDto) {
    return this.authService.signin(body);
  }

  @Post('signup')
  signup(@Body() body: SignupPayloadDto) {
    return this.authService.signup(body);
  }

  /**
   * Authenticated route.
   */
  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  whoami(@Request() req) {
    return req.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
