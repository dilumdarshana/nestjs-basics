import {
  Injectable,
  NotFoundException,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtPayload } from './types/jwt_payload';
import { TokenResponse } from './types/token_respone';
import { AuthResponse } from './types/common';
import refreshConfig from './config/jwt.refresh.config';
import { SignupPayloadDto } from './dto/signup_payload.dto';
import { ROLES } from '../constants/app.constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async signin({ username, password }) {
    const user = await this.userService.findByEmail(username);

    if (!user) throw new NotFoundException(`User ${username} not found`);

    if (!(await verify(user.password, password))) {
      throw new UnauthorizedException(`User ${username} not authorized`);
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_id,
      accessToken,
      refreshToken,
    };
  }

  async signup(user: SignupPayloadDto) {
    const { email } = user;
    const userDb = await this.userService.findByEmail(email);

    if (userDb) throw new ConflictException('User already exists!');

    // find the user role id
    const { id: roleId } = await this.userService.findRoleIdByName(ROLES.USER);

    await this.userService.create({ ...user, role_id: roleId });

    return {
      message: 'User created successfully',
    };
  }

  async generateTokens(user): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.role ?? user.Role?.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateJwtUser(userId: number): Promise<AuthResponse> {
    const user = await this.userService.findById(userId);

    if (!user) throw new UnauthorizedException('Invalid token');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role: user.Role.name,
    };
  }

  async validateRefreshToken(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) throw new UnauthorizedException('Invalid token');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role: user.Role.name,
    };
  }

  async refreshToken(user: AuthResponse) {
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }
}
