import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './report.entity';
import { User } from '../users/user.entity';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly repo: Repository<Report>,
  ) {}

  createReport(body: CreateReportDto, user: User) {
    // attaches the current user (from req.currentUser via @CurrentUser) so
    // the report rows are owned by the signed-in user.
    const report = this.repo.create(body);
    report.user = user;

    return this.repo.save(report);
  }

  async approveReport(id: string, body: ApproveReportDto) {
    const report = await this.repo.findOneBy({ id: parseInt(id) });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // only the approved flag can be changed here (ApproveReportDto)
    report.approved = body.approved;

    return this.repo.save(report);
  }

  // Estimate: AVG price of APPROVED reports of the same make/model, year
  // within +/-3 of the query year, ranked by how close the mileage is.
  // Returns a single raw row { price } — or null if no approved report
  // matches (remember reports are created as approved=false).
  async getReport(query: GetEstimateDto) {
    const { make, model, year, mileage } = query;

    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      // only approved reports count towards the estimate
      .andWhere('approved IS TRUE')
      // closest-matching mileage wins the (3-row) sample
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameter('mileage', mileage)
      .limit(3)
      .getRawOne();
  }
}
