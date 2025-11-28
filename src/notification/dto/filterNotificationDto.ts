import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterNotificationsDto {
  @ApiPropertyOptional({
    example: 'https://banatrics.app/?unread=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  unread?: boolean;

  @ApiPropertyOptional({
    example: 'https://jigi-care.app/?booking=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  booking?: boolean;

  @ApiPropertyOptional({
    example: 'https://jigi-care.app/?order=true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  order?: boolean;

}


