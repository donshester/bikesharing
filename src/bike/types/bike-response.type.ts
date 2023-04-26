import { BikeEntity } from '../bike.entity';

export type BikeResponse = Omit<BikeEntity, 'status'>;
