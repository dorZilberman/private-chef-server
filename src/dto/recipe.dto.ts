
export class RecipeDto {
    readonly title: string;
    readonly products: [{ amount: string; name: string }];
    readonly nutritionalValues?: [{ name: string; value: string }];
    readonly missingItems?: string[];
    readonly instructions: string[];
    readonly imageURL?: string;
}