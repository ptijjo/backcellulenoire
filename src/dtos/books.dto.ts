/* eslint-disable prettier/prettier */
import { CATEGORY } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  public title: string; 
  
  @IsString()
  @IsNotEmpty()
  public author: string;  
  static categorie: CATEGORY;
}


export class UpdatebookDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public author: string;

  @IsString()
  @IsNotEmpty()
  public categorie: CATEGORY;
}
