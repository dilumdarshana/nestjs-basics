import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { SignupPayloadDto } from '../auth/dto/signup-payload.dto';
import { User } from './types/user';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(user: SignupPayloadDto) {
    const { password } = user;

    const hasedPassword = await hash(password);

    return this.prismaService.user.create({
      data: {
        ...user,
        password: hasedPassword,
      },
    });
  }

  findById(id: number): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        Role: true,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        Role: true,
      },
    });
  }

  findRoleIdByName(name: string) {
    return this.prismaService.role.findUnique({
      where: {
        name,
      },
    });
  }
}
