import { Module } from '@nestjs/common';
import { DiskService } from './disk.service';
import { PowerModule } from 'src/power/power.module';

@Module({
  // PowerModule is imported by BOTH CpuModule and DiskModule — Nest gives
  // both a reference to the SAME PowerService singleton (the README's
  // headline DI concept).
  imports: [PowerModule],
  providers: [DiskService],
  exports: [DiskService],
})
export class DiskModule {}
