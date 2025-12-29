import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HealthTipCategory {
  NUTRITION = 'Nutrition',
  EXERCISE = 'Exercise & Fitness',
  SLEEP = 'Sleep & Rest',
  MENTAL_HEALTH = 'Mental Health',
  HYDRATION = 'Hydration',
  PREVENTIVE_CARE = 'Preventive Care',
  CHRONIC_DISEASE = 'Chronic Disease Management',
  HEALTH = 'health', 
}

export class CreateHealthTipDto {
  @ApiProperty({
    description: 'Title of the health tip',
    example: '5 Ways to Improve Your Sleep Quality',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Main content/message of the health tip',
    example:
      'Getting quality sleep is essential for overall health. Here are five evidence-based strategies: 1) Maintain a consistent sleep schedule, 2) Create a relaxing bedtime routine, 3) Keep your bedroom cool and dark, 4) Limit screen time before bed, 5) Avoid caffeine after 2 PM.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Estimated reading time in minutes',
    example: '3',
  })
  @IsString()
  @IsNotEmpty()
  minutesToRead: string;

  @ApiProperty({
    description: 'Category of the health tip',
    enum: HealthTipCategory,
    example: HealthTipCategory.SLEEP,
  })
  @IsEnum(HealthTipCategory)
  @IsNotEmpty()
  category: HealthTipCategory;

  @ApiProperty({
    description: 'URL or path to the tip image',
    example: 'https://example.com/images/sleep-tips.jpg',
  })
  @IsString()
  @IsNotEmpty()
  img: string;
}
