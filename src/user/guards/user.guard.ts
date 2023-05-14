import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExpressRequest } from '../../../types/expressRequest.interface';
import { Reflector } from '@nestjs/core';
import { Roles } from '../types/roles.enum';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<Roles>(
      'role',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<ExpressRequest>();

    if (!requiredRole && request.user) {
      return true;
    }

    if (!request.user || request.user.role !== requiredRole) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    return true;
  }
}
