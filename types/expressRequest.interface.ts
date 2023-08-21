import { Request } from 'express';
import { UserEntity } from '../apps/bikesharing/src/user/user.entity';

export interface ExpressRequest extends Request {
  user?: UserEntity;
}
