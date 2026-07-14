/* eslint-disable prettier/prettier */
import { CATEGORY } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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

export class ToggleBookPublishDto {
  @IsBoolean()
  @IsNotEmpty()
  public isPublished: boolean;
}
