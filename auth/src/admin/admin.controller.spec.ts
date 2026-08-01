import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const db = {
    role: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should delegate to the service with the role name', async () => {
      const createRoleSpy = jest
        .spyOn(adminService, 'createRole')
        .mockResolvedValue({ id: 3, name: 'moderator' } as never);

      const result = await controller.createRole({ name: 'moderator' });

      expect(createRoleSpy).toHaveBeenCalledWith('moderator');
      expect(result).toEqual({ id: 3, name: 'moderator' });
    });
  });

  describe('listRoles', () => {
    it('should delegate to the service', async () => {
      const roles = [{ id: 1, name: 'admin' }];
      const listRolesSpy = jest
        .spyOn(adminService, 'listRoles')
        .mockResolvedValue(roles as never);

      const result = await controller.listRoles();

      expect(listRolesSpy).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });
});
