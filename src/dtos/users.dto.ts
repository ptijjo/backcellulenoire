import { ROLE } from '@prisma/client';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsDate, Validate, IsIn, IsOptional, IsNumber, IsStrongPassword } from 'class-validator';
const cuid = require('cuid');

// Custom validator for CUID
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isCuid', async: false })
class IsCuidConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(cuidValue: string, args: ValidationArguments) {
    return cuid.isCuid(cuidValue); // Check if it's a valid CUID
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return 'idInvitation must be a valid CUID';
  }
}

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
   minSymbols:1,
   }, {
    message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un symbole et au moins 8 caractères."
   })
  public password?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'modo', 'admin', 'new'])
  @IsNotEmpty()
  public role?: ROLE;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(16)
  public pseudo?: string;

  @IsOptional()
  @Validate(IsCuidConstraint)
  @IsNotEmpty()
  public idInvitation: string;

  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  public createdAt: Date;
}

export class InvitationUserDto {
  @IsEmail()
  public email: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  public pseudo: string;
}

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'modo', 'admin', 'new'])
  @IsNotEmpty()
  public role?: ROLE;
}

export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  public password: string;
}
export class UpdateDownloadDto {
  @IsNumber()
  @IsNotEmpty()
  public download: number;
}

export class UpdateAvatarDto{
  @IsString()
  public avatar : string
}
