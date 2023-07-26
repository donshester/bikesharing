import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { BikeStatus } from '../bike.entity';


export class UpdateBikeDto {
  @IsString()
  @IsOptional()
  modelName?: string;

  @IsNumber()
  @IsOptional()
  hourlyPrice?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNotEmpty()
  @IsOptional()
  status?: BikeStatus;
}
