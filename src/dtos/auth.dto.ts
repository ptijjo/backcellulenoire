import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  public identifiant: string;

  @IsString()
  @IsNotEmpty()
  // @IsStrongPassword({
  //   minLength: 8,
  //   minLowercase: 1,
  //   minUppercase: 1,
  //   minNumbers: 1,
  //   minSymbols:1,
  // }, {
  //   message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un symbole et au moins 8 caractères."
  // })
  public password: string;
}
