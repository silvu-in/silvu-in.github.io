// This is an autogenerated file from running `firebase genkit:flow`.
'use server';

/**
 * @fileOverview Provides AI-powered product recommendations based on items in the user's cart.
 *
 * - getProductRecommendations - A function that takes a list of product names in the cart and returns a list of recommended product names.
 * - GetProductRecommendationsInput - The input type for the getProductRecommendations function.
 * - GetProductRecommendationsOutput - The return type for the getProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetProductRecommendationsInputSchema = z.object({
  cartItems: z
    .array(z.string())
    .describe('A list of product names currently in the user\'s cart.'),
});
export type GetProductRecommendationsInput = z.infer<
  typeof GetProductRecommendationsInputSchema
>;

const GetProductRecommendationsOutputSchema = z.object({
  recommendedProducts: z
    .array(z.string())
    .describe('A list of product names recommended for the user.'),
});
export type GetProductRecommendationsOutput = z.infer<
  typeof GetProductRecommendationsOutputSchema
>;

export async function getProductRecommendations(
  input: GetProductRecommendationsInput
): Promise<GetProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const productRecommendationsPrompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: GetProductRecommendationsInputSchema},
  output: {schema: GetProductRecommendationsOutputSchema},
  prompt: `You are an e-commerce expert, skilled at recommending complementary products. Based on the items currently in the user's cart, suggest other products that would enhance their experience. Only suggest items relevant to drones or drone parts.

Cart Items:
{{#each cartItems}}- {{this}}
{{/each}}

Recommended Products:`, // Use Handlebars to iterate through cartItems
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: GetProductRecommendationsInputSchema,
    outputSchema: GetProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await productRecommendationsPrompt(input);
    return output!;
  }
);
