import { IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @Length(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter and one number',
  })
  readonly password: string;

  @Length(2, 50)
  readonly firstName: string;

  @Length(2, 50)
  readonly secondName: string;

  @Matches(/^\+?[0-9]+$/, {
    message:
      'Phone number must contain only digits and may start with a plus sign',
  })
  readonly phone: string;
}
