import { z } from "zod";
import type { APIRoute } from "astro";
import type { StandardResponseDTO, FlashcardDTO } from "../../types";
import { FlashcardsService } from "../../lib/services/flashcards.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

// Prevent static prerendering of API route
export const prerender = false;

// Zod schema for validating individual flashcard
const flashcardSchema = z
  .object({
    front: z.string().max(200, "Front text cannot exceed 200 characters"),
    back: z.string().max(500, "Back text cannot exceed 500 characters"),
    source: z.enum(["manual", "ai-full", "ai-edited"] as const),
    generationId: z.number().nullable(),
  })
  .refine(
    (data) => {
      // Require generationId for AI-generated flashcards
      if (data.source.startsWith("ai-") && data.generationId === null) {
        return false;
      }
      return true;
    },
    {
      message: "generationId is required for AI-generated flashcards",
    }
  );

// Zod schema for the entire request body
const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards per request"),
});

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    const { supabase } = locals;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((err) => err.message).join(", ");

      return new Response(
        JSON.stringify({
          status: "error",
          message: `Validation failed: ${errorMessage}`,
          data: null,
        } satisfies StandardResponseDTO<null>),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create flashcards using the service
    const flashcardsService = new FlashcardsService(supabase);
    const createdFlashcards = await flashcardsService.createFlashcards(
      DEFAULT_USER_ID,
      validationResult.data.flashcards
    );

    // Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        message: "Flashcards created successfully",
        data: createdFlashcards,
      } satisfies StandardResponseDTO<FlashcardDTO[]>),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating flashcards:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Internal server error",
        data: null,
      } satisfies StandardResponseDTO<null>),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
