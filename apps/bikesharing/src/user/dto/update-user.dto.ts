import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsNotEmpty()
  @Length(8)
  readonly password?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly secondName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsPhoneNumber('BY')
  readonly phone?: string;
}
