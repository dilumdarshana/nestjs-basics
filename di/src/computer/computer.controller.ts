import { Body, Controller, Get, Post } from '@nestjs/common';
import { CpuService } from 'src/cpu/cpu.service';
import { DiskService } from 'src/disk/disk.service';
import { Computer } from 'src/shared/types/computer';
import { ComputerService } from './computer.service';

// Demonstrates DI at the controller level: Nest injects CpuService, DiskService
// and ComputerService via the constructor. The two leaf services come from
// modules imported by ComputerModule; ComputerService is a local provider.
@Controller('computer')
export class ComputerController {
  constructor(
    private cpuService: CpuService,
    private diskService: DiskService,
    private computerService: ComputerService,
  ) {}

  // Runs the CPU + disk workload (each draws power from the shared
  // PowerService singleton). No body needed — it's just a demo call.
  @Get()
  run(): unknown[] {
    return [this.cpuService.compute(10, 20), this.diskService.getData()];
  }

  // Registers a computer: stored in ComputerService, then propagated to the
  // network (circular-dependency call chain). Returns 201 with empty body.
  @Post()
  createComputer(@Body() body: Computer): void {
    this.computerService.addComputer(body);
  }
}
