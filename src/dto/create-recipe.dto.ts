import {IsArray} from 'class-validator'

export class CreateRecipeDto {
    @IsArray()
    readonly ingredients: string[]
    @IsArray()
    readonly allergies: string[]
    readonly additionalInput: string
    readonly isRegenerate: boolean
    readonly lastRecipeName?: string
}