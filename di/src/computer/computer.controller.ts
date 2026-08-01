import { Body, Controller, Get, Post } from '@nestjs/common';
import { CpuService } from 'src/cpu/cpu.service';
import { DiskService } from 'src/disk/disk.service';
import { ComputerService } from './computer.service';

interface Computer {
  ip: string;
  name: string;
}

@Controller('computer')
export class ComputerController {
  constructor(
    private cpuService: CpuService,
    private diskService: DiskService,
    private computerService: ComputerService,
  ) {}

  @Get()
  run() {
    return [this.cpuService.compute(10, 20), this.diskService.getData()];
  }

  @Post()
  createComputer(@Body() body: Computer) {
    this.computerService.addComputer(body);
  }
}
