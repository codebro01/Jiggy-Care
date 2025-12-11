import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateLabDto {
  @ApiProperty({
    description: 'The name of the Lab',
    example: 'Pinnacle Laboratory',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The addreess of the Lab',
    example: 'No 60, Akinole steet Egbeda, Lagos State',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Mobile contact of the lab',
    example: '09123232323',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
