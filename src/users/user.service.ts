import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../schemas/user.schema';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class UserService {
  private jwtSecret = process.env.JWT_SECRET_TOKEN as string;
  private jwtRefreshTokenSecret = process.env.JWT_SECRET_REFRESH_TOKEN as string;
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async verify(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  async validateGoogleToken(body): Promise<any> {
    const token = body.credential
    const googleUser = await this.verify(token);
    if (!googleUser) {
      throw new Error('Invalid Google token');
    }
    let user = await this.userModel.findOne({email: googleUser.email});
    if (!user) {
      user = new this.userModel({
        email: googleUser.email,
        password: 'google-auth',
        fullName: googleUser.given_name + ' ' + googleUser.family_name,
        image: googleUser.picture,
        tokens: []
      });
    }
      const accessToken = jwt.sign(
        { email: user.email, userId: user._id },
        this.jwtSecret,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        this.jwtRefreshTokenSecret
      );
      user.tokens.push(refreshToken);
      await user.save();

      return {
        message: 'Google user logged in successfully!',
        userId: user._id,
        accessToken,
        refreshToken,
      };
  }

  async registerUser(body: any, file?: Express.Multer.File): Promise<any> {
    try {
      if (typeof body.jsonData === 'string') {
        body = JSON.parse(body.jsonData);
      }

      const { email, password, name } = body;
      if (!email || !password || !name) throw 'missing parameters';

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        fullName: name,
        image: file?.path || body.image || "",
        tokens: [],
      });

      console.log('newUser');
      console.log(newUser);

      const savedUser = await newUser.save();
      const accessToken = jwt.sign(
        { email: savedUser.email, userId: savedUser._id },
        this.jwtSecret,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: savedUser._id },
        this.jwtRefreshTokenSecret
      );
      newUser.tokens.push(refreshToken);
      await newUser.save();

      return {
        message: 'User created!',
        userId: savedUser._id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('Error registering new user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async registerUserWithGoogle(body: any): Promise<any> {
    try {
      const { email, name, picture } = body;

      const newUser = new this.userModel({
        email,
        password: 'google-auth',
        fullName: name,
        image: picture,
        tokens: [],
      });

      const savedUser = await newUser.save();
      const accessToken = jwt.sign(
        { email: savedUser.email, userId: savedUser._id },
        this.jwtSecret,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: savedUser._id },
        this.jwtRefreshTokenSecret
      );
      newUser.tokens.push(refreshToken);
      await newUser.save();

      return {
        message: 'User created!',
        userId: savedUser._id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException('Error registering new user with Google', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async loginUser(body: any): Promise<any> {
      const { email, password } = body;
      if (!email || !password) throw 'missing parameters';

      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new HttpException('Authentication failed: user not found.', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw new HttpException('Authentication failed: incorrect password.', HttpStatus.UNAUTHORIZED);
      }

      try {
      const accessToken = jwt.sign(
        { email: user.email, userId: user._id },
        this.jwtSecret,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        this.jwtRefreshTokenSecret
      );
      user.tokens.push(refreshToken);
      await user.save();

      return {
        message: 'User Logged In successfully!',
        userId: user._id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException('Error logging in', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async loginUserWithGoogle(body: any): Promise<any> {
    try {
      const { credential } = body;

      const googleUser = await this.verify(credential);
      if (!googleUser) {
        throw new Error('Invalid Google token');
      }
      let user = await this.userModel.findOne({email: googleUser.email});
      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          fullName: googleUser.given_name + ' ' + googleUser.family_name,
          password: 'google-auth',
          image: googleUser.picture,
          tokens: []
        });
      }

      const accessToken = jwt.sign(
        { email: user.email, userId: user._id },
        this.jwtSecret,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        this.jwtRefreshTokenSecret
      );
      user.tokens.push(refreshToken);
      await user.save();

      return {
        message: 'User Logged In successfully with Google!',
        userId: user._id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException('Error logging in with Google', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserProfile(userId: string, body: any, file?: Express.Multer.File): Promise<any> {
    try {
      let fullName: string;
      if (typeof body.jsonData === 'string') {
        fullName = JSON.parse(body.jsonData).fullName;
      } else {
        fullName = body.fullName;
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      if (fullName && user.fullName !== fullName) {
        user.fullName = fullName;
      }

      if (file?.path && user.image !== file.path) {
        user.image = file.path;
      }

      await user.save();
      return { message: 'User profile updated' };
    } catch (error) {
      throw new HttpException('Error updating user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUserProfile(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      await this.userModel.findOneAndDelete(user._id);
      return { message: 'User profile deleted' };
    } catch (error) {
      throw new HttpException('Error deleting user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      return {
        email: user.email,
        fullName: user.fullName,
        image: user.image,
      };
    } catch (error) {
      throw new HttpException('Error retrieving user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
