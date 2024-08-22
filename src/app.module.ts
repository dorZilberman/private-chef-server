import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './recipes/recipe.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';


@Module({
  imports: [RecipeModule, IngredientsModule, UserModule, CommentsModule, LikesModule,
    MongooseModule.forRoot('mongodb://localhost/PrivateChefDB'),
    ServeStaticModule.forRoot({
      rootPath: path.resolve('uploads'),
      serveRoot: '/uploads', // Serve files from this directory under the /uploads path
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
