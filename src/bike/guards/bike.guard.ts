import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as process from 'process';
@Injectable()
export class BikeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) {
      return false;
    }
    try {
      const payload = jwt.verify(token, process.env.SECRET_KEY);
      console.log(token);
      request.bikeId = payload.sub;
      return true;
    } catch (err) {
      return false;
    }
  }
}
