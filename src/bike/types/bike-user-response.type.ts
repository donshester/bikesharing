import { BikeEntity } from '../bike.entity';

export type BikeUserResponse = Omit<BikeEntity, 'status' | 'isAvailable'>;
