import type { SupabaseClient } from "../../db/supabase.client";
import type { CandidateFlashcardDTO, CreateGenerationResponseDTO } from "../../types";
import { createHash } from "crypto";

interface GenerationMetadata {
  userId: string;
  sourceText: string;
  model: string;
  generatedCount: number;
  generationDuration: number;
}

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  private async mockGenerateFlashcards(text: string): Promise<CandidateFlashcardDTO[]> {
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For development, create 3 mock flashcards
    return [
      {
        front: "What is the main topic?",
        back: text.slice(0, 50) + "...",
        source: "ai-full",
      },
      {
        front: "Key concept 1?",
        back: text.slice(50, 100) + "...",
        source: "ai-full",
      },
      {
        front: "Key concept 2?",
        back: text.slice(100, 150) + "...",
        source: "ai-full",
      },
    ];
  }

  private calculateTextHash(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }

  private async saveGenerationMetadata({
    userId,
    sourceText,
    model,
    generatedCount,
    generationDuration,
  }: GenerationMetadata) {
    const { data: generation, error: dbError } = await this.supabase
      .from("generations")
      .insert({
        user_id: userId,
        model,
        generated_count: generatedCount,
        generation_duration: generationDuration,
        source_text_hash: this.calculateTextHash(sourceText),
        source_text_length: sourceText.length,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return generation;
  }

  private async logGenerationError(error: Error, userId: string, sourceText: string) {
    try {
      await this.supabase.from("generation_error_logs").insert({
        user_id: userId,
        error_code: error.name || "UNKNOWN_ERROR",
        error_message: error.message,
        model: "mock-ai-v1",
        source_text_hash: this.calculateTextHash(sourceText),
        source_text_length: sourceText.length,
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }

  async generateFlashcards(sourceText: string, userId: string): Promise<CreateGenerationResponseDTO> {
    const startTime = Date.now();

    try {
      // 1. Generate candidate flashcards using mock AI
      const candidateFlashcards = await this.mockGenerateFlashcards(sourceText);

      // 2. Save generation metadata and get generation record
      const generation = await this.saveGenerationMetadata({
        userId,
        sourceText,
        model: "mock-ai-v1",
        generatedCount: candidateFlashcards.length,
        generationDuration: Date.now() - startTime,
      });

      // 3. Return response with generated flashcards
      return {
        generationId: generation.id,
        generatedCount: generation.generated_count,
        acceptedUneditedCount: generation.accepted_unedited_count,
        acceptedEditedCount: generation.accepted_edited_count,
        candidateFlashcards,
      };
    } catch (error) {
      // Log error and rethrow
      await this.logGenerationError(error as Error, userId, sourceText);
      throw error;
    }
  }
}
