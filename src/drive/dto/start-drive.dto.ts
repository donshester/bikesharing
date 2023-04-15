import {IsISO8601, isISO8601, IsNotEmpty, IsNumber, IsString, Length} from 'class-validator';

export class StartDriveDto {
  @IsNotEmpty()
  @IsString()
  @Length(36, 36)
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  bikeId: number;
}