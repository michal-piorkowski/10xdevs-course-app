import { z } from "zod";
import type { APIRoute } from "astro";
import type { CreateGenerationCommand } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { GenerationService } from "../../lib/services/generation.service";

// Validation schema for the request body
const createGenerationSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text must not exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Validate request body
    const body = (await request.json()) as CreateGenerationCommand;
    const validationResult = createGenerationSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: validationResult.error.errors[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = DEFAULT_USER_ID;
    const { supabase } = locals;

    // Generate flashcards using the service
    const generationService = new GenerationService(supabase);
    const result = await generationService.generateFlashcards(body.sourceText, userId);

    return new Response(
      JSON.stringify({
        status: "success",
        data: result,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generations endpoint:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
