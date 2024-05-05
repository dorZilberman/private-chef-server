import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Ingredient, IngredientSchema } from './ingredients.schema';

@Module({
    imports: [HttpModule, MongooseModule.forFeature([{ name: Ingredient.name, schema: IngredientSchema }]),
],
    controllers: [IngredientsController],
    providers: [IngredientsService],
    exports: [IngredientsService]
})
export class IngredientsModule {}