/* eslint-disable prettier/prettier */
import { CATEGORY } from '@prisma/client';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["histoire","religion","philosophie","spiritualite","jeunesse","sciences","langue"])
  public type: CATEGORY;
}
