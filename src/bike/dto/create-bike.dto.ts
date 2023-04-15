import { BikeStatus } from '../bike.entity';

export class CreateBikeDto {
  readonly modelName: string;

  readonly description: string;

  readonly isAvailable: boolean;

  readonly hourlyPrice: number;

  readonly longitude: number;

  readonly latitude: number;

  readonly status: BikeStatus.Serviceable;
}
