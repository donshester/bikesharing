import { BikeEntity } from '../bike.entity';

export type UpdateBikeDto = Omit<BikeEntity, 'id' | 'longitude' | 'latitude'>;
