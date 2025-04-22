# Schemat bazy danych PostgreSQL

## Tabele

### 1. Tabela: users

This table is managed by Supabase Auth

- `id` UUID PRIMARY KEY
- `email` VARCHAR(200) NOT NULL, UNIQUE
- `encrypted_password` VARCHAR NOT NULL, UNIQUE
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()

### 2. Tabela: flashcards
- `id` BIGSERIAL PRIMARY KEY
- `front` VARCHAR(200) NOT NULL, CHECK (char_length(front) <= 200)
- `back` VARCHAR(500) NOT NULL, CHECK (char_length(back) <= 500)
- `source` VARCHAR NOT NULL, CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- `generation_id` BIGINT NULL, FOREIGN KEY REFERENCES generations(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()

### 3. Tabela: generations
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- `model` VARCHAR NOT NULL
- `generated_count` INTEGER NOT NULL
- `accepted_unedited_count` INTEGER NULLABLE
- `accepted_edited_count` INTEGER NULLABLE
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- `generation_duration` INTEGER NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()

### 4. Tabela: generation_error_logs
- `id` BIGSERIAL PRIMARY KEY
- `user_id` UUID NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
- `model` VARCHAR NOT NULL
- `source_text_hash` VARCHAR NOT NULL
- `source_text_length` INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- `error_code` VARCHAR(100) NOT NULL
- `error_message` TEXT NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

## Relacje między tabelami
- `flashcards.user_id` REFERENCES `users(id)` ON DELETE CASCADE
- `flashcards.generation_id` REFERENCES `generations(id)` ON DELETE CASCADE (nullable)
- `generations.user_id` REFERENCES `users(id)` ON DELETE CASCADE
- `generation_error_logs.user_id` REFERENCES `users(id)` ON DELETE CASCADE

## Indeksy
- Indeks na kolumnie `user_id` w tabelach: `flashcards`, `generations`, `generation_error_logs` (dla poprawy wydajności zapytań).
- Opcjonalny indeks na kolumnie `generation_id` w tabeli `flashcards`.

## Zasady PostgreSQL (RLS)
- W tabelach `flashcards`, `generations` oraz `generation_error_logs` należy włączyć zabezpieczenia na poziomie wierszy (Row Level Security).
- Przykładowa konfiguracja RLS:
  ```sql
  ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_isolation ON <table_name>
    USING (user_id = auth.uid());
  ```
  (Zastąp `<table_name>` odpowiednią nazwą tabeli; funkcja `auth.uid()` powinna zwracać identyfikator aktualnie zalogowanego użytkownika zgodnie z konfiguracją Supabase Auth.)

## Dodatkowe uwagi
- Wszystkie kolumny timestamp (`created_at`, `updated_at`) są ustawiane domyślnie przez bazę danych na wartość `NOW()`.
- Ograniczenia długości w tabeli `flashcards` oraz zakres wartości `source_text_length` w tabelach `generations` i `generation_error_logs` zapewniają integralność danych. 