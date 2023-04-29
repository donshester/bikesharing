import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BikeStatus } from '../bike.entity';

export class UpdateBikeDto {
  @IsString()
  modelName?: string;

  @IsNumber()
  hourlyPrice?: number;

  @IsString()
  description?: string;

  @IsBoolean()
  isAvailable?: boolean;

  @IsNotEmpty()
  status?: BikeStatus;
}
