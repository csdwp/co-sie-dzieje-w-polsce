an## Architektura UI dla „Co się dzieje w Polsce?”

### 1. Przegląd struktury UI

- **Model renderowania**: Pure SSG (Next.js 15). Statyczne wygenerowanie widoków
  2×/dobę synchronicznie z ingestem backendu (Python). Odczyt danych w czasie
  build przez Prisma (Neon/PostgreSQL). Brak publicznych endpointów odczytu dla
  UI w MVP.
- **Identyfikacja aktów**: ELI w URL (deep-link w query) — modal szczegółów na
  stronie głównej: `/?eli={eli}`. Zamknięcie modala usuwa parametr z URL.
- **Role i dostęp**: Clerk (role: `user`, `admin`). Anonim — limit 3 otwarć
  pełnych streszczeń (localStorage, hook `useModalLimit`). Zalogowani — brak
  limitu. Admin — dodatkowe możliwości edycji inline i wgląd w akty niskiej
  pewności.
- **Edycja admina**: Inline w modalu. Zapis przez edycję inline modalu i
  przycisk. Wysylane bezpiśrednio do db + serwerowe wywołanie Vercel Deploy Hook
  (rebuild ~2–5 min). UI pokazuje toast po zapisie.
- **Widoczność niskiej pewności**: Akty z `confidence_score < threshold`:
  - Widoczne i oznaczone badge tylko dla adminów (żółty „⚠️ Wymaga
    weryfikacji”).
  - Dla użytkowników nie-admin — domyślnie odfiltrowane z listy.
- **Główne założenia UX**: Masonry grid dla kart, modal responsywny. Brak client
  cache (SWR/React Query) w MVP.
- **Bezpieczeństwo**: Autoryzacja przez Clerk. Dane w UI neutralizowane przed
  XSS (np. `stripHtml` dla treści edytowalnych), Vercel Deploy Hook trzymany
  wyłącznie po stronie serwera.

Kluczowe (UI-relewantne) endpointy i interfejsy danych:

- Odczyt danych dla SSG — bez publicznego API: Prisma w czasie build (Next.js).
- Inne istniejące route’y (Stripe) są poza MVP (niewykorzystywane przez UI
  listy/edycję): `/api/subscription-plans`, `/api/create-checkout-session`,
  `/api/update-modal-limit`.

Źródła: PRD `.ai/prd.md`, notatki z planowania (ELI routing, inline admin, filtr
pewności, SSG-only, lifebuoy mailto).

### 2. Lista widoków

1. Widok: Strona główna (lista aktów)

- **Ścieżka**: `/` (z obsługą parametru `?eli={eli}` dla modala)
- **Główny cel**: Szybki przegląd najnowszych aktów i wejście do szczegółów.
- **Kluczowe informacje**: Tytuł, data publikacji, krótki snippet (fragment
  `content`), tagi/kategorie, status (jeśli akt podejrzany — badge tylko dla
  adminów).
- **Kluczowe komponenty**: `Navbar`, `SearchBar`, `CardGrid`, `Card`,
  `DarkMode`, `Footer`.
- **UX/a11y/security**:
  - Masonry layout; sort malejąco po dacie.
  - Proste wyszukiwanie po tytule, filtry typ/kategoria.
  - Dla adminów: widoczne badge „⚠️ Wymaga weryfikacji” na kartach o niskiej
    pewności.
  - Dla nie-adminów: akty niskiej pewności ukryte (filtrowane po stronie UI).
  - XSS: render treści skrótowych jako plain text.
- **Powiązane US**: US-001, US-012.

2. Widok: Modal szczegółów aktu

- **Ścieżka**: `/?eli={eli}` (deep-link w query)
- **Główny cel**: Przedstawienie pełnego streszczenia, sekcji wpływu, informacji
  o głosowaniach oraz linku do PDF.
- **Kluczowe informacje**: `simple_title` (jeśli dostępny), pełne `content`
  (format zależny od verbosity), `impact_section`, wyniki głosowań (`votes`),
  link do PDF (`file`), kategoria/keywords, ostrzeżenia (niska pewność — dla
  admina).
- **Kluczowe komponenty**: `DialogModal`, `InlineEditableContent` (admin),
  `VoteChart`, link do PDF, przycisk „🛟 Zgłoś problem” (mailto).
- **UX/a11y/security**:
  - Modal: zamykanie Esc/overlay, focus trap, role=dialog, aria-labelledby.
  - `impact_section`: box informacyjny z ikoną Info; ukryty, jeśli brak danych.
  - Edycja inline (admin): textarea na click, `Zapisz`/`Anuluj`, toast
    „Zapisano. Rebuild w toku (~2–5 min)”.
  - Brak danych: komunikat „dane o głosowaniu niedostępne”/„brak pliku PDF”.
  - Limit anonimów: po 3 pełnych otwarciach — blokujący komunikat i modal do
    logowania.
  - XSS: sanityzacja treści edytowalnych przed zapisem; brak renderu HTML z
    inputu.
- **Powiązane US**: US-002, US-003, US-004, US-012, US-018, US-019.

3. Widok: Tryb admina (UI w tym samym layoucie)

- **Główny cel**: Włączanie widoczności aktów niskiej pewności, edycja inline
  treści, szybka weryfikacja i poprawki.
- **Kluczowe informacje**: Badge trybu admin w `Navbar`, lista aktów z badge
  pewności, dodatkowe akcje w modalu (edycja sekcji).

### 3. Mapa podróży użytkownika

- **Anonim** (US-001, US-002, US-003, US-004):

  1. Wejście na `/` → lista aktów (karty, sort po dacie).
  2. Klik karty → `router.push('/?eli=…', { scroll: false })` → otwiera modal.
  3. Odczyt pełnego streszczenia; licznik w `localStorage` inkrementowany na
     pierwszym wyjściu z modala po pełnym odczycie.
  4. Po 3 odczytach: blokada kolejnych modalów → komunikat z CTA „Zaloguj się”.
  5. Opcjonalnie: klik „🛟 Zgłoś problem” → otwarcie mailto z ID/tytułem i
     linkiem.

- **Zalogowany użytkownik** (US-005, US-006):

  1. Logowanie przez Clerk (SSO/email) → stan `isSignedIn=true`.
  2. Przeglądanie jak anonim, bez limitu odczytów.

- **Admin** (US-008, US-009, US-012, US-013):
  1. Logowanie przez Clerk (SSO/email) → ten sam UI + badge „🛡️”.
  2. Lista pokazuje także akty niskiej pewności (badge „⚠️”).
  3. Otwórz modal → kliknij sekcję → edycja inline → „Zapisz”.
  4. API: POST `/api/admin/update-act` (Clerk admin) → toast „Zapisano…”.
  5. W tle: webhook do Vercel → rebuild (~2–5 min). Modal pozostaje otwarty.

### 4. Układ i struktura nawigacji

- **Top-level layout**:
  - `Navbar`: logo, `SearchBar`, filtry (typ/kategoria), `AuthButtons`,
    `DarkMode`, u admina badge „🛡️”.
  - `Main`: `CardGrid` (kafelki), obsługa scroll/keyboard.
  - `DialogModal`: mountowany warunkowo na `?eli` (focus trap, Esc, close na
    overlay), w środku sekcje: tytuł, meta, `impact_section` (info box), pełne
    `content`, `VoteChart`, link do PDF, `mailto` (🛟).
  - `Footer`.
- **Nawigacja URL**:
  - Otwarcie modala: dodanie `eli` do query bez zmiany scrolla.
  - Zamknięcie: usunięcie `eli` z query; back/forward działa intuicyjnie.
- **Tryb admin**:
  - Ten sam layout; różni się warunkowym renderowaniem (badge, widoczność aktów
    niskiej pewności, kontrole edycji).

### 5. Kluczowe komponenty

- `Navbar` — globalna nawigacja, badge admina, kontrolki auth i trybu ciemnego.
- `SearchBar` — wyszukiwanie po tytule; dostępność: label, aria, klawisz Enter.
- `CardGrid` — responsywna siatka kart; sort po dacie; filtr typu/kategorii.
- `Card` — wyświetla tytuł, datę, snippet, tagi; badge „⚠️” (tylko admin) dla
  niskiej pewności; klik otwiera modal.
- `DialogModal` — kontener szczegółów aktu; focus trap, Esc, aria; sekcje danych
  i CTA.
- `InlineEditableContent` — tryb edycji dla admina w sekcjach
  `simple_title`/`content`/`impact_section`; walidacja, „Zapisz/Anuluj”, toast.
- `VoteChart` — wykres głosowań; ukryty przy braku danych; opis dostępności.
- `AuthButtons` — logowanie/rejestracja Clerk.
- `DarkMode` — przełącznik trybu.
- `Footer` — linki, prawa, e-mail admina z env.
- Hook `useModalLimit` — licznik odczytów dla anonimów; blokujący komunikat po
  przekroczeniu limitu i CTA do logowania.
