import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { BikeStatus } from '../bike.entity';

export class CreateBikeDto {
  @IsNotEmpty()
  @IsString()
  readonly modelName: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsBoolean()
  readonly isAvailable: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly hourlyPrice: number;

  @IsNotEmpty()
  @IsNumber()
  readonly longitude: number;

  @IsNotEmpty()
  @IsNumber()
  readonly latitude: number;

  @IsNotEmpty()
  readonly status: BikeStatus;
}
