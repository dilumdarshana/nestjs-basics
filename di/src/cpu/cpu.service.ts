import { Injectable } from '@nestjs/common';
import { PowerService } from 'src/power/power.service';

@Injectable()
export class CpuService {
  constructor(private powerService: PowerService) {}

  compute(a: number, b: number) {
    this.powerService.supplyPower(100);
    console.log('Drawing 100W of power from powser service');

    return a + b;
  }
}
