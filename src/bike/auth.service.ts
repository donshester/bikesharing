import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { BikeEntity } from './bike.entity';
import * as process from 'process';

@Injectable()
export class AuthService {
  generateToken(bike: BikeEntity) {
    const payload = { sub: bike.id };
    return jwt.sign(payload, process.env.SECRET_KEY);
  }
}
