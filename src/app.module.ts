import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './recipes/recipe.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';

@Module({
  imports: [RecipeModule, IngredientsModule, UserModule,
    MongooseModule.forRoot('mongodb://localhost/PrivateChefDB')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
