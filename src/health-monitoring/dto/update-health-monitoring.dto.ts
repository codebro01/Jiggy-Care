import { PartialType } from '@nestjs/swagger';
import { CreateHealthMonitoringDto } from './create-health-monitoring.dto';

export class UpdateHealthMonitoringDto extends PartialType(CreateHealthMonitoringDto) {}
