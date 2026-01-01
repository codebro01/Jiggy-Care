import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty, IsNumber, Min } from "class-validator";



export class AddCartItemDto {
  @ApiProperty({
    description: 'The UUID of the medication',
    example: '97cd3831-b54b-465a-8d63-af6540668951',
  })
  @IsUUID()
  @IsNotEmpty()
  medicationId: string;

  @ApiProperty({
    description: 'The quantity to add',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class UpdateCartItemQuantityDto {
  @ApiProperty({
    description: 'The new quantity',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
