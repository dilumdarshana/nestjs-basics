import { Test, TestingModule } from '@nestjs/testing';
import { CpuService } from './cpu.service';
import { PowerService } from 'src/power/power.service';

describe('CpuService', () => {
  let service: CpuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CpuService,
        {
          provide: PowerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CpuService>(CpuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
