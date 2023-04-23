import { IsEmail, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email?: string;

  @IsNotEmpty()
  @Length(7)
  readonly password?: string;

  @IsNotEmpty()
  readonly firstName?: string;

  @IsNotEmpty()
  readonly secondName?: string;

  @IsNotEmpty()
  @IsPhoneNumber('BY')
  readonly phone?: string;
}
