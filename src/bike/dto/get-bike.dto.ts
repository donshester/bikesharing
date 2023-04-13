import { BikeEntity } from '../bike.entity';

export type GetBikeDto = Omit<BikeEntity, 'isAvailable' | 'status'>;
