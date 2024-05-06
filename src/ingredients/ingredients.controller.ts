import { Controller, Get } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './ingredients.schema';

@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) {}

    @Get()
    GetIngredients(): Promise<Ingredient[]> { // Update the return type to Promise<Ingredient[]>
        return this.ingredientsService.getIngredients();
    }
  }