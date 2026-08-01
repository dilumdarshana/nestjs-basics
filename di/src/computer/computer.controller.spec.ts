import { Test, TestingModule } from '@nestjs/testing';
import { ComputerController } from './computer.controller';
import { ComputerService } from './computer.service';
import { CpuService } from 'src/cpu/cpu.service';
import { DiskService } from 'src/disk/disk.service';

describe('ComputerController', () => {
  let controller: ComputerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComputerController],
      providers: [
        {
          provide: CpuService,
          useValue: {},
        },
        {
          provide: DiskService,
          useValue: {},
        },
        {
          provide: ComputerService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ComputerController>(ComputerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
