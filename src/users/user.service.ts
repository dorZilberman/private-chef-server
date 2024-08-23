import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../schemas/user.schema';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';


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
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          image: user.image,
        },
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

      const imagePath = file ? await this.saveImage(file) : "";

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        fullName: name,
        image: imagePath,
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
      throw new HttpException('Error registering new user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async saveImage(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.resolve('uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const uniqueSuffix = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueSuffix);

    await fs.promises.writeFile(filePath, file.buffer);

    return `/uploads/${uniqueSuffix}`; // This is the relative path that can be stored in the database
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
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          image: user.image,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException('Error logging in', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserProfile(userId: string, body: any, file?: Express.Multer.File): Promise<any> {
    try {
      let fullName: string;
      let allergies: string[];

      if (typeof body.jsonData === 'string') {
        fullName = JSON.parse(body.jsonData).fullName;
        allergies = JSON.parse(body.jsonData).allergies;

      } else {
        fullName = body.fullName;
        allergies = JSON.parse(body.allergies)
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      // If a new image file is uploaded
      if (file) {
        // Optionally delete the old image file
        if (user.image != `/uploads/${file.originalname}`) {
          const oldImagePath = path.join(path.resolve(), user.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Delete the old image
          }
        }

        // Save the new image
        const newImagePath = await this.saveImage(file);
        user.image = newImagePath;
      }

      if (fullName && user.fullName !== fullName) {
        user.fullName = fullName;
      }

      if (allergies && user.allergies !== allergies) {
        user.allergies = allergies;
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
