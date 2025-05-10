# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Managed by Supabase Auth. Fields include `id`, `email`, `encrypted_password`, `created_at` and `updated_at`.
- **Flashcards**: Corresponds to the `flashcards` table. Contains flashcard content (`front` and `back`), source (either `ai-full`, `ai-edited`, or `manual`), and foreign keys to `users` and optionally to `generations`.
- **Generations**: Corresponds to the `generations` table. Represents AI-generated flashcard sessions including model used, counts, source text hash/length, and generation duration.
- **Generation Error Logs**: Corresponds to the `generation_error_logs` table. Stores error details for generation failures including error codes and messages.

## 2. Endpoints

### A. Flashcard Endpoints

These endpoints support both manual creation and AI-generated flashcards including review operations.

- **GET /api/flashcards**
  - Description: Retrieve a paginated list of flashcards belonging to the authenticated user.
  - Query Parameters: `page`, `limit`, `sort`, `order`, `filter`
  - Response:
    ```json
    { 
      "data": [ 
        { "id": 1, "front": "...", "back": "...", "source": "manual", "created_at": "...", "updated_at": "..." }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100
      }
    }
    ```
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized

- **GET /api/flashcards/{id}**
  - Description: Retrieve details of a single flashcard.
  - Response:
    ```json
    { "id": 1, "front": "...", "back": "...", "source": "ai-edited", "created_at": "...", "updated_at": "..." }
    ```
  - Success Codes: 200 OK
  - Error Codes: 404 Not Found, 401 Unauthorized

- **POST /api/flashcards**
  - Description: Create one or multiple flashcards, supporting both manual and AI-generated entries.
  - Validations:
    - Each flashcard in the array must have:
      - "front" required and not exceeding 200 characters
      - "back" required and not exceeding 500 characters
      - "source" must be one of: "manual", "ai-full", or "ai-edited"
    - For AI-generated cards, "generationId" is required
  - Request Payload:
    ```json
    {
      "flashcards": [
        {
          "front": "Question text (max 200 characters)",
          "back": "Answer text (max 500 characters)",
          "source": "manual",
          "generationId": null
        },
        {
          "front": "AI generated question",
          "back": "AI generated answer",
          "source": "ai-full",
          "generationId": 123
        }
      ]
    }
    ```
  - Response:
    ```json
    {
      "message": "Flashcards created successfully",
      "flashcards": [
        { "id": 1, "front": "...", "back": "...", "source": "manual" },
        { "id": 2, "front": "...", "back": "...", "source": "ai-full" }
      ]
    }
    ```
  - Success Codes: 201 Created
  - Error Codes: 400 Bad Request, 401 Unauthorized

- **PUT /api/flashcards/{id}**
  - Description: Update an existing flashcard (manual or reviewed AI-generated).
  - Validations:
    - "front" must not exceed 200 characters.
    - "back" must not exceed 500 characters.
    - "source" must be one of `ai-edited` or `manual`
  - Request Payload:
    ```json
    {
      "front": "Updated question text",
      "back": "Updated answer text",
      "source": "manual"
    }
    ```
  - Response:
    ```json
    { "message": "Flashcard updated successfully", "flashcard": { "id": 1, "front": "...", "back": "...", "source": "..." } }
    ```
  - Success Codes: 200 OK
  - Error Codes: 400 Bad Request, 404 Not Found, 401 Unauthorized

- **DELETE /api/flashcards/{id}**
  - Description: Delete a flashcard.
  - Response:
    ```json
    { "message": "Flashcard deleted successfully" }
    ```
  - Success Codes: 200 OK
  - Error Codes: 404 Not Found, 401 Unauthorized

#### Additional Flashcard Review Endpoints (for AI-generated flashcards)

- **POST /api/flashcards/{id}/accept**
  - Description: Accept a generated flashcard, finalizing its creation.
  - Response:
    ```json
    { "message": "Flashcard accepted and saved", "flashcard": { "id": 1, "front": "...", "back": "..." } }
    ```
  - Success Codes: 200 OK
  - Error Codes: 404 Not Found, 401 Unauthorized

- **PUT /api/flashcards/{id}/edit**
  - Description: Edit a generated flashcard during the review process before acceptance.
  - Request Payload: (same as update payload)
  - Response: Similar to standard update endpoint.

- **DELETE /api/flashcards/{id}/reject**
  - Description: Reject a generated flashcard, discarding it from review.
  - Response:
    ```json
    { "message": "Flashcard rejected" }
    ```
  - Success Codes: 200 OK, 401 Unauthorized


### B. Generation Endpoints

These endpoints manage the overall flashcard generation session and its associated statistics.

- **POST /api/generations**
  - Description: Initiate a flashcard generation process. Validates input text length and triggers the AI model.
  - Validations:
    - "sourceText" must be provided and its length must be between 1000 and 10000 characters.
  - Request Payload:
    ```json
    { "sourceText": "<text of 1000-10000 characters>" }
    ```
  - Response:
    ```json
    { "generationId": 123,
      "generatedCount": 10,
      "acceptedUneditedCount": 0,
      "acceptedEditedCount": 0,
      "candidateFlashcards": [ { "tempId": "abc-123", "front": "...", "back": "..." } ]
    }
    ```
  - Success Codes: 202 Accepted
  - Error Codes: 400 Bad Request, 500 Internal Server Error, 401 Unauthorized

- **GET /api/generations**
  - Description: Retrieve a list of generation sessions for the user, including statistics.
  - Response:
    ```json
    { "generations": [ { "id": 123, "model": "...", "generatedCount": 10, "created_at": "..." } ] }
    ```
  - Success Codes: 200 OK


### V. Generation Error Logs Endpoints

- **GET /api/generation-error-logs**
  - Description: Retrieve error logs related to flashcard generation. (Access may be limited to admin users or the owner.)
  - Response:
    ```json
    { "errorLogs": [ { "id": 1, "error_code": "ERR_001", "error_message": "Description of error", "created_at": "..." } ] }
    ```
  - Success Codes: 200 OK


## 3. Authentication and Authorization

- **Authentication**: The API uses Supabase Auth to manage user sign-up, login, and token issuance. Each request (except public endpoints) must include a valid JWT in the `Authorization` header.
- **Authorization**: Row Level Security (RLS) is enforced on tables (`flashcards`, `generations`, `generation_error_logs`) using policies that ensure `user_id = auth.uid()`. Endpoints verify that the authenticated user is allowed to access or modify the requested resource.


## 4. Validation and Business Logic

- **Input Validation**:
  - Flashcards:
    - `front`: Maximum 200 characters.
    - `back`: Maximum 500 characters.
    - `source`: Must be one of `ai-full`, `ai-edited` or `manual`
  - Generation:
    - `sourceText`: Must be between 1000 and 10000 characters.
  - All endpoints should perform early validation and return a 400 error for invalid inputs.

- **Business Logic**:
  - **Flashcard Generation**:
    - Submitted text is validated for length before triggering AI processing.
    - AI-generated flashcards are returned as candidates, not immediately stored. They require user review.
    - Upon user acceptance, flashcards are saved permanently; if edited, changes are logged accordingly.
  - **Error Logging**:
    - Generation failures trigger the creation of an error log with `error_code` and `error_message` in the `generation_error_logs` table.
  - **Spaced Repetition**:
    - User responses update flashcard review schedules via an integrated open-source spaced repetition algorithm.

## 5. HTTP Status Codes and Error Handling

- **200 OK**: Successful GET, PUT, DELETE operations.
- **201 Created**: Successful POST operations for creation.
- **202 Accepted**: When processing (e.g., AI generation) is asynchronous.
- **400 Bad Request**: Validation errors or malformed requests.
- **401 Unauthorized**: Missing or invalid authentication token.
- **404 Not Found**: Resource not found.
- **409 Conflict**: Attempt to create a duplicate resource (e.g., duplicate email during registration).
- **500 Internal Server Error**: Unhandled server errors.

Every response should include a standardized JSON structure, for example:

```json
{
  "status": "success", // or "error"
  "data": { ... },
  "message": "Detailed message if needed"
}
```

## Additional Considerations

- **Pagination, Filtering & Sorting**: Endpoints returning lists support query parameters such as `page`, `limit`, `sort`, `order` and `filter` to handle large datasets.
- **Error Logging**: Ensure that all errors are logged for debugging and auditing purposes.

This API plan is designed to be aligned with the specified tech stack (Astro, React, TypeScript, Tailwind, Shadcn/ui) and the Supabase backend, ensuring a robust, secure, and user-friendly educational flashcard application. 