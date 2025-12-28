import { PartialType } from '@nestjs/swagger';
import { CreateHealthTipDto } from './create-health-tip.dto';

export class UpdateHealthTipDto extends PartialType(CreateHealthTipDto) {}
