import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import jwtRefreshConfig from './config/jwt.refresh.config';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role_id: 2,
    password: 'password',
    created_at: new Date(),
  };

  const mockUserDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role_id: 1,
  };

  const mockRole = {
    id: 1,
    name: 'user',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env
              .JWT_EXPIRATION as JwtSignOptions['expiresIn'],
          },
        }),
        ConfigModule.forFeature(jwtRefreshConfig),
      ],
      providers: [
        AuthService,
        UserService,
        PrismaService,
        {
          provide: 'REFRESH_TOKEN_CONFIG',
          useValue: {
            secret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(() => {
    jest
      .spyOn(userService, 'findByEmail')
      .mockClear()
      .mockResolvedValue(mockUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should signin works', async () => {
    jest
      .spyOn(require('argon2'), 'verify')
      .mockImplementation(() => Promise.resolve(true));

    jest.spyOn(service as any, 'generateTokens').mockResolvedValue({
      accessToken: 'xxxx',
      refreshToken: 'yyyy',
    });

    const result = await service.signin({
      username: 'test@example.com',
      password: 'test123',
    });

    expect(result).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role_id,
      accessToken: 'xxxx',
      refreshToken: 'yyyy',
    });
  });

  it('shold throw exception when user not found', async () => {
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

    await expect(
      service.signin({
        username: 'test@example.com',
        password: 'test123',
      }),
    ).rejects.toThrow(`User test@example.com not found`);
  });

  it('should signup validate existing user', async () => {
    await expect(service.signup(mockUserDto)).rejects.toThrow(
      'User already exists!',
    );
  });

  it('should signup works', async () => {
    jest.spyOn(userService, 'findByEmail').mockClear().mockResolvedValue(null);

    jest.spyOn(userService, 'findRoleIdByName').mockResolvedValue(mockRole);

    jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

    const result = await service.signup(mockUserDto);

    expect(result.message).toEqual('User created successfully');
  });

  it('should generate token work', async () => {
    const spySignAsync = jest.spyOn(jwtService, 'signAsync');

    spySignAsync
      .mockImplementationOnce(() => Promise.resolve('mockAccessToken'))
      .mockImplementationOnce(() => Promise.resolve('mockRefreshToken'));

    const result = await service.generateTokens({
      ...mockUser,
      Role: { name: 'admin' },
    });

    expect(result).toEqual({
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    });

    expect(spySignAsync).toHaveBeenCalledTimes(2);
  });
});
