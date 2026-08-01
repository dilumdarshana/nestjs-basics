import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@example.com',
          password: '123',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 999, email, password: '123' } as User]),
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 999, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findUser throws an error if the user does not exist', () => {
    fakeUsersService.findOne = () => null;

    expect(controller.findUser(1)).rejects.toThrow(NotFoundException);
  });

  it('findAllUsers return a list of users for a given email', async () => {
    const users = await controller.findAllUsers('test@example.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  });

  it('findUser returns a user for a given', async () => {
    const user = await controller.findUser(999);

    expect(user).toBeDefined();
  });

  it('findUser returns error on no user', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser(999)).rejects.toThrow(NotFoundException);
  });

  it('sigin update session object and return user', async () => {
    const session = { userId: 0 };
    const user = await controller.signin(
      { email: 'test@example.com', password: '123' },
      session,
    );

    expect(user.id).toEqual(999);
    expect(session.userId).toEqual(999);
  });
});
