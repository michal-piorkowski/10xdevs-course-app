# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu
Fiszki AI to aplikacja webowa wspomagająca naukę poprzez tworzenie fiszek edukacyjnych. System umożliwia generowanie fiszek przy użyciu sztucznej inteligencji na podstawie wprowadzonego tekstu, jak również ręczne tworzenie, edycję oraz usuwanie fiszek. Aplikacja zapewnia prosty system kont użytkowników, który umożliwia logowanie, zmianę hasła oraz usuwanie konta, gwarantując jednocześnie, że każdy użytkownik ma dostęp wyłącznie do swoich danych. Dodatkowo, Fiszki AI integruje się z gotowym, open-source algorytmem powtórek, co pozwala na efektywne planowanie sesji nauki według metody spaced repetition.

## 2. Problem użytkownika
Użytkownicy chcą korzystać z efektywnej metody nauki – spaced repetition – jednak manualne tworzenie wysokiej jakości fiszek jest czasochłonne i wymaga wiedzy, jak optymalnie dzielić informacje. Brak wsparcia automatyzacji w generowaniu fiszek powoduje frustrację i ogranicza wykorzystanie tej skutecznej metody nauki. Użytkownicy potrzebują zatem narzędzia, które:
- Automatycznie generuje fiszki na podstawie wprowadzonego tekstu.
- Umożliwia łatwą recenzję, edycję i akceptację wygenerowanych fiszek.
- Zapewnia intuicyjny, prosty interfejs, oszczędzając czas potrzebny na manualne tworzenie fiszek.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI
    - Użytkownik wkleja tekst (w formacie czystego tekstu) o długości od 1000 do 10000 znaków.
    - System waliduje długość tekstu przed przetwarzaniem.
    - AI generuje zestaw fiszek, w których „przód” nie przekracza 200 znaków, a „tył” 500 znaków.
    - Fiszki wygenerowane przez AI nie są natychmiast zapisywane w bazie – trafiają do panelu recenzji.

2. Recenzja wygenerowanych fiszek
    - Użytkownik ma możliwość przeglądania kandydatów na fiszki.
    - Dla każdej fiszki dostępne są opcje: zaakceptowanie, edycja lub odrzucenie.
    - Akceptacja fiszki skutkuje zapisaniem jej w systemie oraz rejestracją statusu w bazie logów.

3. Ręczne tworzenie fiszek
    - Aplikacja umożliwia użytkownikowi ręczne tworzenie fiszek przez prosty formularz (modal).
    - Formularz wymusza walidację długości: „przód” – max 200 znaków, „tył” – max 500 znaków.
    - Ręcznie utworzone fiszki są natychmiast zapisywane i widoczne na liście "Moje fiszki"

4. Edycja i usuwanie fiszek
    - Użytkownik może przeglądać listę zapisanych fiszek, tych wygenerowanych i tych ręcznie zapisanych do "Moje fiszki".
    - Dostępny jest mechanizm edycji lub usunięcia wybranej fiszki poprzez ten sam formularz używany do tworzenia.

5. System kont użytkowników
    - Rejestracja nowych użytkowników.
    - Logowanie, zmiana hasła oraz usuwanie konta.
    - Dostęp do danych jest ograniczony wyłącznie do autoryzowanych użytkowników.

6. Integracja z algorytmem powtórek
    - System wykorzystuje gotowy, open-source algorytm do realizacji sesji spaced repetition.
    - Po zapisaniu fiszek użytkownik może rozpocząć sesję powtórek zgodnie z harmonogramem określonym przez algorytm.
      - Po uruchomieniu sesji nauki użytkownikowi pokazywane są "przody" fiszek, a on odpowiada na pytania.
      - System rejestruje odpowiedzi użytkownika (poprawne/niepoprawne) i na ich podstawie ustala harmonogram kolejnych sesji powtórek.
      - Użytkownik ma możliwość przeglądania historii sesji powtórek oraz statystyk dotyczących postępów w nauce.

7. Statystyki generowania fiszek
    - Zbieranie informacji o tym, ile fiszek zostało wygenerowanych przez AI i ile z nich ostatecznie zaakceptowano.
    - Logi te służą do oceny jakości generowanych fiszek.

8. Bezpieczeństwo i prywatność
    - Uwierzytelnianie użytkowników zgodnie z najlepszymi praktykami.
    - Ochrona danych osobowych użytkowników zgodnie z RODO.
    - Prawo do wglądu, edycji i usunięcia danych osobowych przez użytkowników.

## 4. Granice produktu
W ramach MVP nie zostaną zaimplementowane następujące funkcjonalności:
1. Własny, zaawansowany algorytm powtórek (takich jak SuperMemo czy Anki) – wykorzystana zostanie gotowa biblioteka open-source.
2. Import dokumentów w wielu formatach, np. PDF, DOCX.
3. Współdzielenie zestawów fiszek między użytkownikami.
4. Integracja z innymi platformami edukacyjnymi.
5. Aplikacje mobilne – na początek dostępna będzie jedynie wersja web.
6. Dodatkowe funkcje, takie jak testy A/B, personalizacja ustawień czy rozbudowany system audytu.

## 5. Historyjki użytkowników

ID: US-001  
Tytuł: Rejestracja, logowanie i zarządzanie kontem  
Opis: Jako nowy użytkownik chcę móc się zarejestrować i zalogować do systemu, aby móc zarządzać swoimi fiszkami. Aplikacja musi umożliwić zmianę hasła oraz usunięcie konta zgodnie ze standardowymi praktykami bezpieczeństwa.  
Kryteria akceptacji:
- Użytkownik może zarejestrować się, podając wymagane dane (np. e-mail, hasło).
- System weryfikuje dane i tworzy konto.
- Użytkownik otrzymuje potwierdzenie rejestracji.
- Logowanie przebiega poprawnie, umożliwiając dostęp do danych użytkownika.
- Funkcje zmiany hasła oraz usunięcia konta działają zgodnie z założeniami, a operacje są bezpieczne.

ID: US-002  
Tytuł: Generowanie fiszek przez AI  
Opis: Jako użytkownik chcę wprowadzić tekst (od 1000 do 10000 znaków) i otrzymać wygenerowany przez AI zestaw fiszek, aby zaoszczędzić czas na ich ręcznym tworzeniu.  
Kryteria akceptacji:
- W widoku generowania fiszek znajduje się pole tekstowe do wklejenia treści i za pomocą przycisku „Generuj fiszki” użytkownik inicjuje proces.
- System waliduje długość wprowadzonego tekstu.
- Po zatwierdzeniu tekstu, aplikacja komunikuje się z API modelu LLM i AI generuje zestaw fiszek, gdzie każdy element ma „przód” nie dłuższy niż 200 znaków oraz „tył” nie dłuższy niż 500 znaków.
- W przypadku problemów z API, system informuje użytkownika o błędzie.
- Wygenerowane fiszki pojawiają się jako kandydaci do recenzji, a nie są jeszcze zapisywane w bazie.

ID: US-003  
Tytuł: Recenzja i akceptacja wygenerowanych fiszek  
Opis: Jako użytkownik chcę przejrzeć fiszki wygenerowane przez AI, aby móc zaakceptować, edytować lub odrzucić poszczególne fiszki przed ich ostatecznym zapisaniem.  
Kryteria akceptacji:
- System wyświetla listę fiszek wygenerowanych przez AI w trybie recenzji.
- Przy każdej fiszce dostępne są opcje: „zaakceptuj”, „edytuj” oraz „odrzuć”.
- Przy akceptacji, fiszka jest zapisywana w systemie i logowana jako zaakceptowana.
- W przypadku edycji, system umożliwia zmianę treści przy zachowaniu ograniczeń długości.
- Odrzucenie fiszki oznacza, że nie zostanie zapisana w systemie.

ID: US-004  
Tytuł: Ręczne tworzenie fiszek  
Opis: Jako użytkownik chcę mieć możliwość ręcznego tworzenia fiszek za pomocą formularza, aby móc tworzyć fiszki w sytuacjach, gdy automatyczne generowanie przez AI nie spełnia moich oczekiwań.  
Kryteria akceptacji:
- Użytkownik otwiera formularz (modal) dostępny z poziomu listy fiszek.
- Formularz umożliwia wprowadzenie treści „przodu” (max 200 znaków) oraz „tyłu” (max 500 znaków).
- System waliduje długość wprowadzonych treści.
- Po zapisaniu, fiszka pojawia się na liście użytkownika.

ID: US-005  
Tytuł: Edycja i usuwanie fiszek  
Opis: Jako użytkownik chcę móc edytować oraz usuwać wcześniej zapisane fiszki, aby móc na bieżąco aktualizować swoją bazę fiszek i usuwać te, które nie są już potrzebne.  
Kryteria akceptacji:
- Użytkownik wybiera fiszkę z listy i otwiera formularz edycji.
- Formularz umożliwia modyfikację treści z zachowaniem ograniczeń długości.
- Zmodyfikowana fiszka jest zapisywana i odświeżana na liście.
- Użytkownik może usunąć wybraną fiszkę, a system potwierdza operację przed ostatecznym usunięciem.

ID: US-006  
Tytuł: Rozpoczęcie sesji powtórek  
Opis: Jako użytkownik chcę rozpocząć sesję powtórek na podstawie zapisanych fiszek, aby móc efektywnie utrwalać materiał zgodnie z metodą spaced repetition.  
Kryteria akceptacji:
- Użytkownik uruchamia tryb powtórek z poziomu swojego konta.
- System integruje się z open-source algorytmem powtórek, który ustala harmonogram prezentacji fiszek.
- Podczas sesji, fiszki są prezentowane zgodnie z algorytmem, a odpowiedzi użytkownika (poprawne/niepoprawne) wpływają na dalszy harmonogram powtórek.
- Sesja powtórek jest rejestrowana i monitorowana w systemie.

ID: US-007
Tytuł: Bezpieczny dostęp do danych i autoryzacja
Opis: Jako użytkownik chcę mieć pewność, że moje dane i fiszki są bezpieczne i dostępne tylko dla mnie, aby chronić moją prywatność.
Kryteria akceptacji:
- Tylko zalogowany użytkownik może wyświetlić, edytować lub usunąć swoje fiszki.
- Nie ma możliwości dostępu do danych ani fiszek innych użytkowników ani możliwości współdzielenia ich.

## 6. Metryki sukcesu
1. 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika – mierzone poprzez analizę statusów (zaakceptowana, odrzucona, wyedytowana) zapisanych w dedykowanej tablicy logów.
2. Użytkownicy tworzą 75% fiszek wykorzystując funkcję generacji przez AI zamiast ręcznego tworzenia.
3. Monitorowanie liczby wygenerowanych fiszek i porównanie ich z liczbą zaakceptowanych fiszek w celu oceny jakości generowanych treści.
