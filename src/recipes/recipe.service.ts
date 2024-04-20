import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RecipeService {
  constructor(private httpService: HttpService) {}

  async getRecipe(input: string): Promise<string> {
    const apiKey = 'AIzaSyBcVOkOTe2EaJDzohefkuu_gjRnSq8-yGQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const body = {
      "contents": [
        {
          "parts": [
            {
              "text": input
            }
          ]
        }
      ]
    };

    try {
      const response: AxiosResponse = await this.httpService.post(url, body).toPromise();
      const responstData = response.data;
      return responstData?.candidates[0]?.content.parts[0]?.text;
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      throw new Error('Failed to retrieve the recipe.');
    }
  }
}
