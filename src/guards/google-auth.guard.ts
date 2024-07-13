import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const credential = request.body.credential;

    if (!credential) {
      throw new HttpException('Google ID token missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new HttpException('Invalid Google ID token', HttpStatus.UNAUTHORIZED);
      }

      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new HttpException('Invalid Google ID token', HttpStatus.UNAUTHORIZED);
    }
  }
}
