import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prismaService: PrismaService) {}

  async createRole(roleName: string) {
    // validate role name exists
    const roleDb = await this.roleFindByName(roleName);

    if (roleDb) throw new ConflictException('Role already exists');

    // create role in database
    return this.prismaService.role.create({
      data: {
        name: roleName,
      },
    });
  }

  roleFindByName(roleName: string) {
    return this.prismaService.role.findUnique({
      where: {
        name: roleName,
      },
    });
  }
}
