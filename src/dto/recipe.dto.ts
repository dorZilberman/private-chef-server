
export class RecipeDto {
    readonly title: string;
    readonly products: [{ amount: string; name: string }];
    readonly nutritional_values?: string[];
    readonly instructions: string[];
    readonly imageURL?: string;
}