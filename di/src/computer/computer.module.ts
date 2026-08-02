import { forwardRef, Module } from '@nestjs/common';
import { CpuModule } from 'src/cpu/cpu.module';
import { DiskModule } from 'src/disk/disk.module';
import { NetworkModule } from 'src/network/network.module';
import { ComputerController } from './computer.controller';
import { ComputerService } from './computer.service';

@Module({
  // CpuModule/DiskModule export their services so ComputerController can
  // inject CpuService + DiskService. NetworkModule is the circular half —
  // forwardRef lets each module reference the other before either is ready.
  imports: [CpuModule, DiskModule, forwardRef(() => NetworkModule)],
  controllers: [ComputerController],
  providers: [ComputerService],
  exports: [ComputerService],
})
export class ComputerModule {}
