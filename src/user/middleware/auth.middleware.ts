import { ExpressRequest } from '../../../types/expressRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserService } from '../user.service';
import * as process from 'process';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization;

    try {
      const decode = verify(token, process.env.SECRET_KEY) as JwtPayload;
      req.user = await this.userService.findById(decode.id);
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  }
}
