import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum BikeStatus {
  Serviceable = 'Serviceable',
  OutOfOrder = 'OutOfOrder',
}
export class BikeCsvDto {
  @IsNotEmpty()
  @IsString()
  modelName: string;

  @IsNotEmpty()
  @IsNumber()
  hourlyPrice: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  isAvailable: boolean;

  @IsNotEmpty()
  @IsString()
  status: BikeStatus;
}
