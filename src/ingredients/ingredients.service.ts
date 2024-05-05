import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient, IngredientDocument } from './ingredients.schema';
import { IngredientType } from 'src/entities/ingredient.entity';

@Injectable()
export class IngredientsService {
    constructor(private httpService: HttpService, 
        @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>
    ) {}

    async getIngredients(): Promise<Ingredient[]> {
        return this.ingredientModel.find().exec();
        
    }

    async getIngredientsFromCSV(): Promise<IngredientType[]> {
        const ingredients: IngredientType[] = [];
    
        return new Promise((resolve, reject) => {
          fs.createReadStream('./top-1k-ingredients.csv')
            .pipe(csv({separator: ';', headers: ['name', 'id']}))
            .on('data', (row) => {
              const ingredient: IngredientType = {
                id: row.id,
                name: row.name,
              };
              ingredients.push(ingredient);
            })
            .on('end', () => {
              console.log('CSV file successfully processed');
              resolve(ingredients);
            })
            .on('error', (error) => {
              reject(error);
            });
        });
      }

        // Fetch data from external API
     async getIngredientsFromExternalAPI(): Promise<IngredientType[]> {
         
     const app_id = '842f706c';
     const app_key = '4bb973828c699cad723e4ca5e3a0f9f5';
     let allData = []
     let limitReached = false

         try {
             let nextPageUrl = "https://api.edamam.com/api/food-database/v2/parser?app_id=842f706c&app_key=4bb973828c699cad723e4ca5e3a0f9f5";

             while (nextPageUrl && !limitReached) {
                 const response = await this.httpService.get<any>(nextPageUrl).toPromise(); // Await the response
                 const responseData = response.data;
                 responseData.hints.forEach(element => {
                        const ingredient: IngredientType = {
                            id: element.food.foodId,
                            name: element.food.label,
                        };
                        allData.push(ingredient);
                 });
                 nextPageUrl = responseData._links?.next?.href;
             }
     }
     catch (error) {
        limitReached = true;
         console.error('Failed to fetch ingredients:', error);
     }
     finally {
        return Promise.resolve(allData);
     }
        
}
}