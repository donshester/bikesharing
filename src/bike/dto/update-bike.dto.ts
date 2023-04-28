import { BikeStatus } from '../bike.entity';

export class UpdateBikeDto {
  modelName: string;

  hourlyPrice: number;

  description: string;

  isAvailable: boolean;

  status: BikeStatus;
}
