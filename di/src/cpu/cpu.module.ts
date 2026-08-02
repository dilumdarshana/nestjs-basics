import { Module } from '@nestjs/common';
import { CpuService } from './cpu.service';
import { PowerModule } from 'src/power/power.module';

@Module({
  // PowerModule provides + exports PowerService; importing it here makes
  // PowerService injectable into CpuService.
  imports: [PowerModule],
  providers: [CpuService],
  exports: [CpuService],
})
export class CpuModule {}
