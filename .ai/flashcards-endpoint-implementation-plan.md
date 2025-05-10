# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia tworzenie jednego lub wielu fiszek edukacyjnych. Obsługuje zarówno wpisy ręczne, jak i generowanie za pomocą AI, zapewniając walidację danych wejściowych, autoryzację użytkownika oraz zapisywanie rekordów w bazie danych przy użyciu Supabase.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/flashcards
- **Parametry:**
  - **Wymagane:**
    - `flashcards`: tablica obiektów, z których każdy musi zawierać:
      - `front`: string (maksymalnie 200 znaków, niezbędny)
      - `back`: string (maksymalnie 500 znaków, niezbędny)
      - `source`: string (jedna z wartości: "manual", "ai-full", "ai-edited")
      - `generationId`: number lub null (wymagane przy użyciu fiszek generowanych przez AI)
  - **Opcjonalne:**
    - Nie przewidziano dodatkowych parametrów. Autoryzacja opiera się na sesji użytkownika.

## 3. Wykorzystywane typy
- **DTO:**
  - `FlashcardDTO`
  - `CreateFlashcardDTO`
  - `CreateFlashcardsRequestDTO`
- **Command Modele:**
  - `UpdateFlashcardCommand` (mogą być wykorzystane w przypadku aktualizacji, choć głównie endpoint dotyczy tworzenia fiszek)

## 4. Szczegóły odpowiedzi
- **Sukces (201 Created):**
  - Odpowiedź zawiera komunikat powodzenia oraz listę utworzonych fiszek. Przykład:
    ```json
    {
      "message": "Flashcards created successfully",
      "flashcards": [
        { "id": 1, "front": "...", "back": "...", "source": "manual" },
        { "id": 2, "front": "...", "back": "...", "source": "ai-full" }
      ]
    }
    ```
- **Błędy:**
  - 400 Bad Request: Nieprawidłowe dane wejściowe (np. przekroczenie limitu znaków, brak wymaganych pól)
  - 401 Unauthorized: Brak autoryzacji użytkownika
  - 500 Internal Server Error: Błędy wewnętrzne serwera lub bazy danych

## 5. Przepływ danych
1. **Odbiór żądania:** Endpoint odbiera żądanie POST zawierające tablicę obiektów `flashcards`.
2. **Walidacja:** Dane wejściowe są walidowane przy użyciu Zod, sprawdzając poprawność długości tekstu, wymagane pola oraz poprawność wartości pola `source`.
3. **Autoryzacja:** Uwierzytelnienie użytkownika odbywa się przy użyciu Supabase z wykorzystaniem `context.locals`.
4. **Interakcja z bazą danych:** Po pomyślnej walidacji dane są zapisywane w tabeli `flashcards` z odpowiednim powiązaniem do bieżącego użytkownika i podanego generation_id.
5. **Odpowiedź:** Po udanym wstawieniu rekordów endpoint zwraca odpowiedź z kodem 201 oraz szczegóły utworzonych fiszek.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Endpoint wymaga zweryfikowanej sesji użytkownika.
- **Walidacja danych:** Użycie biblioteki Zod do walidacji danych wejściowych minimalizuje ryzyko wprowadzenia błędnych danych.
- **Bezpieczeństwo bazy:** Stosowanie dobrze skonstruowanych zapytań Supabase oraz mechanizmów kontroli dostępu chroni przed atakami typu SQL Injection.
- **Ograniczenia dostępu:** Endpoint jest dostępny tylko dla uwierzytelnionych użytkowników.

## 7. Obsługa błędów
- **Walidacja danych:** W przypadku naruszenia reguł walidacji, zwracany jest status 400 z odpowiednimi komunikatami o błędach.
- **Autoryzacja:** Jeżeli użytkownik nie jest autoryzowany, zwracany jest status 401.
- **Błędy operacyjne:** Błędy podczas operacji bazy danych są przechwytywane i zwracany jest status 500.

## 8. Rozważania dotyczące wydajności
- **Bulk Insert:** W przypadku wielu fiszek w jednym żądaniu warto zastosować operację wsadowego wstawiania (bulk insert) w celu optymalizacji liczby zapytań.
- **Transakcje:** Rozważenie użycia transakcji przy wstawianiu wielu rekordów, aby zachować integralność danych.
- **Asynchroniczność:** Implementacja asynchronicznych wywołań do bazy danych, aby zmniejszyć blokady głównego wątku.

## 9. Etapy wdrożenia
1. **Utworzenie endpointu:** Stworzenie pliku `/src/pages/api/flashcards.ts` jako nowego endpointu API.
2. **Implementacja walidacji:** Definicja Zod schema dla `CreateFlashcardsRequestDTO`, która zapewni walidację wymaganych pól.
3. **Wyodrębnienie logiki serwisowej:** Przeniesienie logiki biznesowej do nowego lub istniejącego serwisu (np. `/src/lib/services/flashcards.service.ts`).
4. **Sprawdzenie autoryzacji:** Implementacja mechanizmu uwierzytelniania przy użyciu Supabase i pobieranie użytkownika z `context.locals`.
5. **Operacje na bazie danych:** Wstawienie danych do tabeli `flashcards` przy użyciu Supabase oraz zastosowanie mechanizmu bulk insert i/lub transakcji w przypadku wielu rekordów.
6. **Obsługa błędów:** Dodanie odpowiednich bloków obsługi błędów, które zwracają statusy 400, 401 lub 500 i logują błędy.