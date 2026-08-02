import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ReportDto } from './dtos/report.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { AdminGuard } from '../guards/admin.guard';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  // create + approve need the current user, so they rely on the global
  // CurrentUserMiddleware having populated req.currentUser first.
  @Post('/')
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportService.createReport(body, user);
  }

  // NOTE: AdminGuard alone -> unauthenticated requests 500 (currentUser
  // undefined). See guards/admin.guard.ts.
  @Patch('/:id')
  @UseGuards(AdminGuard)
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportService.approveReport(id, body);
  }

  // deliberately unguarded — anyone can query estimates
  @Get()
  getReport(@Query() query: GetEstimateDto) {
    return this.reportService.getReport(query);
  }
}
