import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;

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
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role when the name does not exist', async () => {
      db.role.findUnique.mockResolvedValue(null);
      db.role.create.mockResolvedValue({ id: 5, name: 'moderator' });

      const result = await service.createRole('moderator');

      expect(db.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'moderator' },
      });
      expect(db.role.create).toHaveBeenCalledWith({
        data: { name: 'moderator' },
      });
      expect(result).toEqual({ id: 5, name: 'moderator' });
    });

    it('should throw ConflictException when the role already exists', async () => {
      db.role.findUnique.mockResolvedValue({ id: 1, name: 'admin' });

      await expect(service.createRole('admin')).rejects.toThrow(
        ConflictException,
      );
      expect(db.role.create).not.toHaveBeenCalled();
    });
  });

  describe('listRoles', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
      ];
      db.role.findMany.mockResolvedValue(roles);

      const result = await service.listRoles();

      expect(db.role.findMany).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });
});
