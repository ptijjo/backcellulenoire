import { ROLE } from '@prisma/client';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsDate, Validate, IsIn, IsOptional, IsNumber } from 'class-validator';
const cuid = require('cuid');

// Custom validator for CUID
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

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

const IsStrongPassword = (validationOptions?: ValidationOptions) => {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          console.log(args);
          const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
          return typeof value === 'string' && strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          console.log(args);
          return 'Le mot de passe doit contenir entre 8 et 16 caractères, avec au moins une majuscule, un chiffre et un symbole.';
        },
      },
    });
  };
};

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
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
