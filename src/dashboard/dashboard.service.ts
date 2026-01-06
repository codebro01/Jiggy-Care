import { Injectable } from '@nestjs/common';
import { DashboardRepository } from '@src/dashboard/repository/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async consultantDashboard(consultantId: string) {
    return this.dashboardRepository.consultantDashboard(consultantId);
  }


  async adminDashboards() {
    const adminDashboard = await this.dashboardRepository.adminDashboard();

    return adminDashboard;
  }
}
