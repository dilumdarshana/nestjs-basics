import { Module } from '@nestjs/common';
import { PowerService } from './power.service';

@Module({
  // Leaf module: provides PowerService and exports it so any module that
  // imports PowerModule can inject the same singleton instance.
  providers: [PowerService],
  exports: [PowerService],
})
export class PowerModule {}
