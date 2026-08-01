import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('role')
  createRole(@Body() role: CreateRoleDto) {
    return this.adminService.createRole(role.name);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Get('roles')
  listRoles() {
    return this.adminService.listRoles();
  }
}
