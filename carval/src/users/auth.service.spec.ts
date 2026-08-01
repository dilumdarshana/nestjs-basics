import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    // create a fake copy of the user service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    // create a new DI container
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    await service.signup('test@test.com', '123');

    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const res = await service.signup('test@test.com', '123');
    const [salt, hash] = res.password.split('.');

    expect(res.email).toEqual('test@test.com');
    expect(res.password).not.toEqual('123');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error when user signup with email already exists', async () => {
    // fakeUsersService.find = () => Promise.resolve([{ email: 'foo@bar.com', password: '123' } as User]);
    await service.signup('foo@bar.com', '123');

    await expect(service.signup('foo@bar.com', '123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error when user signin with non existing email', async () => {
    await expect(service.signin('foo@bar.com', '123')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws an error when user gives invalid password', async () => {
    // fakeUsersService.find = () => Promise.resolve([{ email: 'foo@bar.com', password: '123' } as User]);
    await service.signup('foo@bar.com', '123');

    await expect(service.signin('foo@bar.com', '456')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should signin user with valid email and password', async () => {
    await service.signup('foo@bar.com', '123');

    const user = await service.signin('foo@bar.com', '123');

    expect(user.email).toEqual('foo@bar.com');
  });
});
