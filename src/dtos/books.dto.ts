/* eslint-disable prettier/prettier */
import { CATEGORY } from '@prisma/client';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public author: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['histoire', 'religion', 'philosophie', 'spiritualite', 'jeunesse', 'sciences', 'langue', 'roman'])
  public categoryName: CATEGORY;
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

export class ToggleBookPublishDto {
  @IsBoolean()
  @IsNotEmpty()
  public isPublished: boolean;
}
