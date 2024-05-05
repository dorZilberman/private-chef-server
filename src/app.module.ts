import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './recipes/recipe.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [RecipeModule, IngredientsModule,
    MongooseModule.forRoot('mongodb://localhost/PrivateChefDB')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
