import { forwardRef, Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { ComputerModule } from '../computer/computer.module';

@Module({
  // mirror of ComputerModule: forwardRef resolves the mutual import.
  imports: [forwardRef(() => ComputerModule)],
  providers: [NetworkService],
  controllers: [NetworkController],
  exports: [NetworkService],
})
export class NetworkModule {}
