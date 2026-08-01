import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let userService: UserService;

  const createUserDto = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'hashedpassword',
    role_id: 2,
  };

  const createUserRes = {
    ...createUserDto,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$oDBGMUAl/euo6XIOg+BhPA$x1LfUByQZmt6u7A75MzHuDXTKcsfkw89APAOW0bJ9eI',
  };

  const db = {
    user: {
      create: jest.fn().mockResolvedValue(createUserRes),
      findUnique: jest.fn().mockResolvedValue({ id: 2, name: 'test' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create a new user', async () => {
    const res = await userService.create(createUserDto);

    expect(res).toMatchObject(createUserRes);
  });

  it('should work find by id', async () => {
    const res = await userService.findById(1);

    expect(res).toEqual({ id: 2, name: 'test' });
  });
});
