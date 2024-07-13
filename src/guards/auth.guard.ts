import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new HttpException('Authorization header missing', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException('Token missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN as string);
      request.user = decoded;
      return true;
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
