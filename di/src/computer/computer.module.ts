import { forwardRef, Module } from '@nestjs/common';
import { ComputerController } from './computer.controller';
import { CpuModule } from './../cpu/cpu.module';
import { DiskModule } from 'src/disk/disk.module';
import { ComputerService } from './computer.service';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [CpuModule, DiskModule, forwardRef(() => NetworkModule)],
  controllers: [ComputerController],
  providers: [ComputerService],
  exports: [ComputerService],
})
export class ComputerModule {}
