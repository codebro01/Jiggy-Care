 import { ApiPropertyOptional } from "@nestjs/swagger";
 import { IsString, IsOptional } from "class-validator";
 
export class UpdateDpDto {
  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1691234567/avatar.jpg',
    description: 'Profile picture (URL)',
  })
  @IsString()
  @IsOptional()
  dp?: string;
}