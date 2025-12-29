import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRecentActivityDto {
    @ApiProperty({
        example: 'Prescription refilled', 
        description: 'The recent activity'
    })
    @IsNotEmpty()
    @IsString()
    action: string
}
