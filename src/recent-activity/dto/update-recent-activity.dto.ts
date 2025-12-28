import { PartialType } from '@nestjs/swagger';
import { CreateRecentActivityDto } from './create-recent-activity.dto';

export class UpdateRecentActivityDto extends PartialType(CreateRecentActivityDto) {}
