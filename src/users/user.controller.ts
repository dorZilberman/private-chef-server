import { Controller, Post, Body, Req, Res, Put, Delete, Get, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async registerUser(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.registerUser(req.body, file);
    res.status(201).json(result);
  }

  @Post('login')
  async loginUser(@Body() body: any, @Res() res: Response) {
    try {
      const result = await this.userService.loginUser(body);
      res.status(200).json(result);
    }
    catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @Post('login-google')
  @UseGuards(GoogleAuthGuard)
  async loginUserWithGoogle(@Body() body: any, @Res() res: Response) {
    const result = await this.userService.validateGoogleToken(body);
    res.status(200).json(result);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfile(@Req() req: Request, @Res() res: Response, @UploadedFile() file: Express.Multer.File) {
    const user = (req as any).user;
    const result = await this.userService.updateUserProfile(user.userId, req.body, file);
    res.status(200).json(result);
  }

  @Delete('profile')
  @UseGuards(AuthGuard)
  async deleteUserProfile(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const result = await this.userService.deleteUserProfile(user.userId);
    res.status(200).json(result);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getUserProfile(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const result = await this.userService.getUserProfile(user.userId);
    res.status(200).json(result);
  }
}
