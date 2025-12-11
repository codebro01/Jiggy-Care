import { IsNotEmpty, IsString, IsNumber, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum TestTitleType {
  DIABETES = 'diabetes',
  CHOLESTEROL = 'cholesterol',
}

export enum TestCollectionType {
    HOME_COLLECTION = 'home_collection', 
    VISIT_LAB_CENTER = 'visit_lab_center'
}

export class CreateTestDto {
  @ApiProperty({
    example: 'diabetes',
    description:
      'The category of the test that is to be take, i.e the test kind',
  })
  @IsEnum(TestTitleType)
  @IsNotEmpty()
  title: TestTitleType;

  @ApiProperty({
    example: '2 days fasting required',
    description: 'The requirement before the test',
  })
  @IsString()
  @IsNotEmpty()
  preparation: string;

  @ApiProperty({
    example: 'Diabetes Test',
    description: 'A short description of the test',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  // @ApiProperty({
  //   example: 'home_collection',
  //   description:
  //     'The collection of the test either its home or at the lab center',
  // })
  // @IsNotEmpty()
  // @IsEnum(TestCollectionType)
  // collection: TestCollectionType;

  @ApiProperty({
    example: 5,
    description: 'The duration  of the test before the test is completed',
  })
  @IsNotEmpty()
  @IsNumber()
  durationInHrs: number;

  @ApiProperty({
    example: 5000,
    description: 'The cost of the test',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

}
