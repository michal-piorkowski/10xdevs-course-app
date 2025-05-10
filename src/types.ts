/**
 * DTO and Command Models for 10xDevsCourseApp
 * Based on the database models and API plan.
 *
 * This file includes:
 * - FlashcardDTO: Represents a flashcard with fields from the DB model (camelCased keys), using Pick to select only needed fields.
 * - CreateFlashcardDTO and CreateFlashcardsRequestDTO: For creating flashcards in a unified way, supporting all possible source values.
 * - UpdateFlashcardCommand: For updating flashcards (only allows 'manual' or 'ai-edited' sources).
 * - PaginationDTO and PaginatedFlashcardsResponseDTO: For handling paginated flashcard responses.
 * - CreateGenerationCommand: Command to initiate a flashcard generation session.
 * - CandidateFlashcardDTO and CreateGenerationResponseDTO: For AI-generated candidate flashcards during generation.
 * - GenerationListDTO and GenerationListResponseDTO: For listing generation sessions.
 * - GenerationErrorLogDTO and GenerationErrorLogsResponseDTO: For representing generation error logs.
 */

import type { Database } from "./db/database.types";

// Alias types from database models
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
// type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"]; // Not used directly

type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];

type GenerationErrorLogRow = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// Extracted type for flashcard source.
export type FlashcardSource = "ai-full" | "ai-edited" | "manual";

// Optional standard response wrapper
export interface StandardResponseDTO<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

/**
 * FlashcardDTO
 * Derived from the flashcards table row in the database.
 * Uses Pick to select only the required fields and converts snake_case keys to camelCase.
 */

// Pick required fields from FlashcardRow
type FlashcardRowPick = Pick<
  FlashcardRow,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

export interface FlashcardDTO {
  id: FlashcardRowPick["id"];
  front: FlashcardRowPick["front"];
  back: FlashcardRowPick["back"];
  source: FlashcardRowPick["source"];
  generationId: FlashcardRowPick["generation_id"];
  createdAt: FlashcardRowPick["created_at"];
  updatedAt: FlashcardRowPick["updated_at"];
}

/**
 * CreateFlashcardDTO
 * A universal type for creating flashcards. It contains all fields required for insertion into the DB,
 * with generationId allowed to be a number or null. The source uses the extracted FlashcardSource type.
 */
export interface CreateFlashcardDTO {
  front: FlashcardInsert["front"];
  back: FlashcardInsert["back"];
  source: FlashcardSource;
  generationId: number | null;
}

export interface CreateFlashcardsRequestDTO {
  flashcards: CreateFlashcardDTO[];
}

/**
 * UpdateFlashcardCommand
 * Command model for updating a flashcard.
 * Only 'manual' or 'ai-edited' sources are allowed for update.
 */
export interface UpdateFlashcardCommand {
  front: FlashcardRow["front"];
  back: FlashcardRow["back"];
  source: Extract<FlashcardSource, "manual" | "ai-edited">;
  generationId: number | null;
}

/**
 * PaginationDTO and PaginatedFlashcardsResponseDTO
 * DTOs for handling paginated flashcard responses.
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedFlashcardsResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

/**
 * Generation Command and DTOs
 */

// Command to initiate a flashcard generation session
export interface CreateGenerationCommand {
  sourceText: string; // Must be between 1000 and 10000 characters.
}

// Candidate flashcard produced by AI during generation (not from DB)
export interface CandidateFlashcardDTO {
  front: string;
  back: string;
  source: "ai-full";
}

/**
 * CreateGenerationResponseDTO
 * Response DTO for a generation session creation.
 * Maps GenerationRow fields to camelCase and adds candidateFlashcards.
 */
export interface CreateGenerationResponseDTO {
  generationId: GenerationRow["id"];
  generatedCount: GenerationRow["generated_count"];
  acceptedUneditedCount: GenerationRow["accepted_unedited_count"];
  acceptedEditedCount: GenerationRow["accepted_edited_count"];
  candidateFlashcards: CandidateFlashcardDTO[];
}

/**
 * GenerationListDTO and GenerationListResponseDTO
 * DTOs for listing generation sessions.
 */
export interface GenerationListDTO {
  id: GenerationRow["id"];
  model: GenerationRow["model"];
  generatedCount: GenerationRow["generated_count"];
  createdAt: GenerationRow["created_at"];
}

export interface GenerationListResponseDTO {
  generations: GenerationListDTO[];
}

/**
 * Generation Error Log DTOs
 * Maps snake_case keys from the DB to camelCase.
 */
export type GenerationErrorLogDTO = Pick<GenerationErrorLogRow, "id"> & {
  errorCode: GenerationErrorLogRow["error_code"];
  errorMessage: GenerationErrorLogRow["error_message"];
  createdAt: GenerationErrorLogRow["created_at"];
};

export interface GenerationErrorLogsResponseDTO {
  errorLogs: GenerationErrorLogDTO[];
}
