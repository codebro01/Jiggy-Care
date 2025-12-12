import { PartialType } from '@nestjs/swagger';
import { CreateHealthReadingDto } from '@src/health-monitoring/dto/create-health-monitoring.dto';
export class UpdateHealthReadingDto extends PartialType(CreateHealthReadingDto) {}
