import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardDTO, FlashcardDTO } from "../../types";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  private async validateGenerationIds(flashcards: CreateFlashcardDTO[]): Promise<void> {
    // Get unique generation IDs that need validation (filter out nulls)
    const generationIds = [
      ...new Set(
        flashcards
          .filter(
            (f): f is CreateFlashcardDTO & { generationId: number } =>
              f.source.startsWith("ai-") && f.generationId !== null
          )
          .map((f) => f.generationId)
      ),
    ];

    if (generationIds.length === 0) {
      return;
    }

    // Check if all generation IDs exist
    const { data, error } = await this.supabase.from("generations").select("id").in("id", generationIds);

    if (error) {
      throw error;
    }

    const existingIds = new Set(data?.map((g) => g.id));
    const missingIds = generationIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(`Generation IDs not found: ${missingIds.join(", ")}`);
    }
  }

  async createFlashcards(userId: string, flashcards: CreateFlashcardDTO[]): Promise<FlashcardDTO[]> {
    try {
      // Validate generation IDs before proceeding
      await this.validateGenerationIds(flashcards);

      // Prepare data for bulk insert
      const flashcardsToInsert = flashcards.map((flashcard) => ({
        user_id: userId,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generation_id: flashcard.generationId,
      }));

      // Perform bulk insert
      const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from insert operation");
      }

      // Transform response to DTO format
      return data.map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generationId: flashcard.generation_id,
        createdAt: flashcard.created_at,
        updatedAt: flashcard.updated_at,
      }));
    } catch (error) {
      console.error("Error in createFlashcards:", error);
      throw error;
    }
  }
}
