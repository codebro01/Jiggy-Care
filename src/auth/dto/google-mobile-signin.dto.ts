import { ApiProperty } from '@nestjs/swagger';
import { roleType } from '@src/users/dto/createUser.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleMobileSigninDto {
  @ApiProperty({
    example: 'consultant',
    description: 'The role of the user that is to be created',
  })
  @IsString()
  @IsNotEmpty()
  role: roleType;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.signature',
    description: 'The id token returned from the react sdk',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
