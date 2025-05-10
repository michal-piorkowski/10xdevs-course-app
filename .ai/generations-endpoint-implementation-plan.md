# API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego
Punkt końcowy służy do inicjowania procesu generacji fiszek w oparciu o dostarczony tekst (sourceText). Tekst wejściowy musi mieć długość między 1000 a 10000 znaków. Endpoint waliduje dane wejściowe, autoryzuje użytkownika oraz wywołuje logikę generacji (w tym integrację z modelem AI) i zapisuje dane w odpowiednich tabelach bazy danych przy wykorzystaniu Supabase.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/generations
- **Parametry:**
  - **Wymagane:**
    - `sourceText` (string, długość 1000-10000 znaków)
  - **Opcjonalne:** Brak
- **Przykładowe Body:**
```json
{
  "sourceText": "..."
}
```

## 3. Wykorzystywane typy
- `CreateGenerationCommand` – DTO przekazujący dane wejściowe (sourceText).
- `CreateGenerationResponseDTO` – DTO zwracający odpowiedź generacji.
- `CandidateFlashcardDTO` – reprezentacja tymczasowych fiszek generowanych przez AI.

## 4. Szczegóły odpowiedzi
- **Status przy sukcesie:** 201 Created
- **Struktura odpowiedzi:**
```json
{
  "generationId": 123,
  "generatedCount": 10,
  "acceptedUneditedCount": 0,
  "acceptedEditedCount": 0,
  "candidateFlashcards": [
    { "front": "...", "back": "...", "source": "ai-full" }
  ]
}
```
- **Kody błędów:**
  - 400 Bad Request – nieprawidłowe dane wejściowe
  - 401 Unauthorized – brak autoryzacji
  - 500 Internal Server Error – błąd po stronie serwera

## 5. Przepływ danych
1. Odbiór żądania oraz odczyt danych z body (sourceText).
2. Walidacja `sourceText` przy użyciu Zod (sprawdzenie obecności oraz długości 1000-10000 znaków).
3. Autoryzacja użytkownika z wykorzystaniem `context.locals.supabase` (sprawdzenie tokenu sesji i polityk RLS).
4. Przekazanie danych do warstwy serwisowej `generation.service`, która:
   - Inicjuje wywołanie zewnętrznego modelu AI do generacji candidate fiszek.
   - Oblicza i zapisuje metadane generacji w tabeli `generations`.
   - W przypadku wystąpienia błędów, zapisuje logi w tabeli `generation_error_logs`.
5. Przygotowanie i wysłanie odpowiedzi do klienta zgodnie z DTO `CreateGenerationResponseDTO`.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint powinien być dostępny tylko dla autoryzowanych użytkowników. Używamy `context.locals.supabase` do weryfikacji tokenu.
- **Walidacja wejścia:** Użycie Zod do walidacji `sourceText` pod kątem obecności i poprawnej długości.
- **Zabezpieczenia bazy danych:** Upewnienie się, że polityki RLS w Supabase (Row Level Security) są aktywowane dla tabel `generations` i `generation_error_logs`.
- **Obsługa danych:** Unikamy ujawniania szczegółowych informacji o błędach użytkownikowi.

## 7. Obsługa błędów
- **400 Bad Request:** Jeśli `sourceText` jest nieobecne lub nie spełnia kryteriów długości.
- **401 Unauthorized:** Jeśli użytkownik nie jest autoryzowany.
- **500 Internal Server Error:** Dla błędów podczas operacji bazodanowych lub przetwarzania logiki biznesowej.
- **Logowanie błędów:** Każdy nieoczekiwany błąd zostanie zarejestrowany w tabeli `generation_error_logs` z odpowiednimi szczegółami (errorCode, errorMessage).

## 8. Rozważania dotyczące wydajności
- Timeout dla wywolania AI: 60 sekund na czas oczekiwania, w przeciwnym razie blad timeout.
- Wstępna walidacja wejścia, aby uniknąć zbędnych operacji na bazie.
- Zastosowanie indeksów w tabelach `generations` oraz `generation_error_logs` w celu optymalizacji zapytań.
- Rozważenie wykorzystania asynchronicznego przetwarzania, jeżeli operacje generacji będą czasochłonne.

## 9. Etapy wdrożenia
1. Utworzenie endpointu w pliku `/src/pages/api/generations.ts`.
2. Implementacja walidacji wejścia z użyciem Zod (sprawdzenie, czy `sourceText` jest obecne i poprawnej długości).
3. Weryfikacja autoryzacji użytkownika przy użyciu `context.locals.supabase` zgodnie z politykami RLS.
4. Wyodrębnienie logiki generacji do serwisu `generation.service`:
   - Inicjowanie wywołania modelu AI. Na etapie developmentu skorzystamy z mocków zamiast wywołania serwisu AI
   - Tworzenie rekordu w tabeli `generations`.
   - Logowanie błędów do tabeli `generation_error_logs`.
5. Przygotowanie struktur danych (DTO): `CreateGenerationCommand`, `CreateGenerationResponseDTO`, `CandidateFlashcardDTO`.
6. Implementacja pełnej ścieżki przetwarzania żądania i zwracania odpowiedzi z odpowiednimi kodami statusu (202, 400, 401, 500).