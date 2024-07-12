import { Controller, Get, Post, UploadedFile } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './ingredients.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';

@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) {}

    @Get()
    GetIngredients(): Promise<Ingredient[]> { // Update the return type to Promise<Ingredient[]>
        return this.ingredientsService.getIngredients();
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    GetImageIngredients(@UploadedFile() file: Express.Multer.File): Promise<Ingredient[]>{
        return this.ingredientsService.getIngredientsFromImage(file);
    }
  }
