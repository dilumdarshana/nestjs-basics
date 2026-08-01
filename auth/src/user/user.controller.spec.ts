import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './types/user';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser: User = {
    id: 1,
    name: 'Alex',
    email: 'alex@example.com',
    password: 'xxxx',
    role_id: 2,
    created_at: new Date(),
    Role: {
      id: 2,
      name: 'user',
      created_at: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findRoleIdByName: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find the user', async () => {
    jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);

    expect(await controller.findOne('1')).toBe(mockUser);
    expect(userService.findById).toHaveBeenCalledWith(1);
  });
});
