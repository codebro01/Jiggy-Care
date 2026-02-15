import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export enum AppointmentStatus {
  COMPLETED = 'completed',
  UPCOMING = 'upcoming',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  DISPUTED = 'disputed',
  PENDING_CONFIRMATION = 'pending_confirmation',
}

export class QueryBookingDto {
  @ApiProperty({
    description: 'query appointment by status',
    required: false,
    example: 'pending_confirmation',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus



  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
