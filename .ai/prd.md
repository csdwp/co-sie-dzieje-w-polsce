# Dokument wymagań produktu (PRD) - Co się dzieje w Polsce?

## 1. Przegląd produktu

Krótki opis: Aplikacja "Co się dzieje w Polsce?" dostarcza obywatelom zwięzłe,
przystępne streszczenia najważniejszych ustaw i rozporządzeń publikowanych w
Polsce. System pobiera metadane aktów z rządowego API, generuje uproszczone
podsumowania za pomocą modelu LLM (z parametrem verbosity) i prezentuje je
użytkownikom wraz z linkiem do oryginalnego PDF-a.

Cel MVP: Udostępnić działającą, stabilną aplikację umożliwiającą przeglądanie i
czytanie uproszczonych streszczeń aktów prawnych, z prostą kontrolą dostępu
(limit odczytów dla anonimów w localStorage), edycją treści przez admina oraz
zapleczem operacyjnym do ponownego przetwarzania brakujących danych.

Zakres czasowy MVP: podstawowa funkcjonalność produkcyjna z ingestem 2×
dziennie, prostą edycją dla admina (textarea + API), oraz limitami dostępu
(anonim 3 odczyty w localStorage - łatwe do obejścia, akceptowane w MVP).
Priorytet na stabilność backendu i mechanizmy reprocessingu kolejkowego.

## 2. Problem użytkownika

Główny problem: Obywatele mają trudność z szybkim zrozumieniem, które zmiany w
prawie ich dotyczą i w jaki sposób, oraz nie zawsze wiedzą, jak głosowały partie
polityczne.

Konsekwencje problemu:

- Niska transparentność procesu legislacyjnego.
- Trudność w podejmowaniu świadomych decyzji obywatelskich.
- Brak zaufania do źródeł informacji ze względu na ich złożoność.

W jaki sposób produkt rozwiązuje problem:

- Automatyczne dostarczanie krótkich, zrozumiałych streszczeń (różne formaty w
  zależności od typu aktu).
- Informacje o wpływie zmian na obywatela i podsumowanie kto i jak głosował.
- Panel admina do kontroli jakości i ręcznej weryfikacji streszczeń niskiego
  zaufania.

Grupa docelowa (MVP): przeciętny obywatel zainteresowany bieżącymi zmianami
prawa; użytkownicy anonimowi oraz zalogowani; administratorzy treści.

## 3. Wymagania funkcjonalne

3.1 Ingest i przetwarzanie danych

- Ingest job uruchamiany 2× dziennie (cron). (NF-001)
- Pobranie metadanych i linku do PDF z rządowego API; zapis metadanych: title,
  act_number, simple_title, content, refs, texts, item_type, announcement_date,
  change_date, promulgation, item_status, comments, keywords, file, votes
  (JSON), category, impact_section, idempotency_key. Dodatkowe pola techniczne:
  confidence_score (Decimal 3,2), needs_reprocess (Boolean), created_at,
  updated_at, ingested_at. (NF-002)
- Idempotentny pipeline: każdy rekord ma idempotency_key; ponowne uruchomienie
  nie powiela wpisów. (NF-003)
- Parsowanie metadanych i wysłanie tekstu (lub fragmentów) do LLM z parametrem
  verbosity (TL;DR / punkty / rozbudowane). (NF-004)
- Zapisywanie outputu LLM w polach: content (pełne streszczenie), simple_title
  (uproszczony tytuł), impact_section (wpływ na obywatela) oraz confidence_score
  (Decimal 3,2 - wartość od 0.00 do 9.99 wskazująca pewność modelu). (NF-005)
- Oznaczanie niskiej pewności: jeśli confidence_score < prog (konfigurowalny,
  domyślnie 0.50), akt nie jest widoczny dla zwykłych użytkowników. Jest
  widoczny tylko na liście admina z odpowiednim oznaczeniem, aby mógł go
  zweryfikować. Admin może edytować wszystkie akty niezależnie od
  confidence_score. (NF-006)
- Retry/backoff i alerty operacyjne przy błędach ingestu; metryki błędów i
  logowanie. (NF-007)
- Kolejka reprocessingu: akty wymagające ponownego przetworzenia (brakujące
  PDFy, błędy LLM) są oznaczane flagą needs_reprocess i przetwarzane
  priorytetowo przy kolejnych uruchomieniach crona. (NF-008)

  3.2 Backend i przechowywanie

- Baza danych relacyjna (MVP):
  - Tabela `acts`: przechowuje wszystkie akty prawne z metadanymi (title,
    act_number, dates), streszczeniami LLM (content, simple_title,
    impact_section), danymi operacyjnymi (confidence_score, needs_reprocess,
    created_at, updated_at, ingested_at), oraz dodatkowymi informacjami (refs[],
    texts[], keywords[], votes JSON, file, category).
  - Tabela `category`: słownik kategorii z przypisanymi słowami kluczowymi
    (category jako PK, keywords[] jako tablica stringów) - używana do
    automatycznej kategoryzacji aktów.
  - Uwierzytelnianie użytkowników zarządzane przez Clerk (bez dedykowanej tabeli
    w bazie). (NF-009)
- Przechowujemy: metadane, streszczenia generowane przez LLM (pola: content,
  simple_title, impact_section), linki do PDF (pole file). Nie przechowujemy
  surowych plików PDF w bazie. (NF-010)

  3.3 Frontend i prezentacja

- Frontend generowany statycznie (SSG) 2× dziennie, synchronicznie z cronem
  ingestu backendu; build tworzy statyczne HTML/CSS/JS hostowane na CDN.
  (NF-011)
- Strona główna z listą kafelków aktów (chronologicznie/od najnowszych). Każdy
  kafelek: tytuł, data, krótki snippet, tagi (np. sektor), status jeżeli
  podejrzany. (NF-012)
- Widok szczegółowy aktu: streszczenie (format zależny od verbosity), sekcja
  "Jak to wpływa na obywatela", informacja o wynikach głosowania i stanowiskach
  partii (jeśli dostępne), link do oryginalnego PDF. (NF-013)
- Limit odczytów dla anonima: po przeczytaniu 3 pełnych streszczeń przeglądanie
  zostaje zablokowane (zliczanie w localStorage, łatwe do obejścia -
  akceptowalne w MVP). UI informuje o limicie, opcji zalogowania i komunikacie
  że pełna ochrona będzie w wersji premium. Po zalogowaniu (Clerk) licznik nie
  jest sprawdzany. (NF-014)
- Zalogowani użytkownicy: opcjonalne logowanie (Clerk) — role: user i admin;
  zalogowani użytkownicy mają zwiększony dostęp (w MVP: brak limitu lub
  konfigurowalny zwiększony limit). (NF-015)

  3.4 Panel admina

- Oznaczanie aktów niskiej pewności: akty z confidence_score < threshold (np.
  0.50) mają widoczny badge na liście dla admina (NF-017)
- Edycja treści streszczenia: admin otwierając akt widzi textarea zamiast
  zwykłego tekstu, może edytować i zapisać. Zapis wywołuje Next.js API route
  (POST /api/admin/update-act) która aktualizuje bazę danych i triggeruje Vercel
  rebuild webhook. (NF-018)
- Mechanizm powiadomień email o aktach niskiej pewności: Python script wysyła
  email do admina dla aktów z confidence < threshold podczas ingestu. (NF-020)

  3.5 Operacje i utrzymanie

- Mechanizm reprocessingu: kolejka aktów z flagą needs_reprocess=true,
  przetwarzane priorytetowo przy kolejnych uruchomieniach crona (każde 12h).
  Brak on-demand API - reprocessing automatyczny. (NF-021)
- Dashboard operacyjny: liczba ingestów, procent błędów, ostatnie nieudane
  próby, liczba rekordów wymagających reprocessingu (needs_reprocess=true),
  liczba rekordów z brakującymi danymi (file IS NULL dla brakującego PDF, votes
  IS NULL dla brakujących danych o głosowaniu). (NF-022)
- Prosty mechanizm zgłaszania problemu pod streszczeniem — przycisk "Zgłoś
  problem" otwierający pre-wypełnioną wiadomość mailto z ID aktu i linkiem.
  (NF-023)

  3.6 Bezpieczeństwo i zgodność

- Autoryzacja i uwierzytelnianie przez zewnętrzny provider (Clerk) z mapowaniem
  ról. (NF-024)
- Dane w spoczynku i w tranzycie zabezpieczone (HTTPS, szyfrowanie pól w bazie
  zgodne z polityką). (NF-025)
- Minimalna polityka dostępu: tylko admin może edytować i publikować. (NF-026)

  3.7 Konfiguracja LLM i monitoring jakości

- Parametr verbosity dostępny podczas generowania summary. (NF-027)
- Pole confidence_score (Decimal 3,2) w metadanych; metryki i powiadomienia gdy
  confidence_score < threshold (threshold konfigurowalny, domyślnie 0.50).
  (NF-028)

## 4. Granice produktu

Co jest w MVP (zwięzłe):

- Rejestracja i logowanie (opcjonalne, Clerk); role user/admin. (B-001)
- Lista aktów z krótkimi podsumowaniami. (B-002)
- Limit dostępu: anonimowy użytkownik 3 odczyty (localStorage - łatwe do
  obejścia, akceptowane w MVP). (B-003)
- Konto admina z możliwością edycji przez textarea + API route. (B-004)
- Ingest 2× dziennie, dane + link do PDF. (B-005)
- Akty z niskim confidence_score (< threshold) są widoczne tylko dla adminów. Po
  zapisaniu przez admina, confidence_score jest maksymalizowany i stają
  się widoczne dla wszystkich. Admin może edytować dowolny akt. (B-006)
- Przechowujemy metadane i streszczenia LLM w bazie; PDFy tylko jako linki (pole
  file). (B-007)
- Prosty mechanizm zgłoszeń (mailto z pre-wypełnionym tematem). (B-008)

Co nie wchodzi do MVP:

- System płatności / subskrypcji. (B-009)
- Generowanie contentu na platformy społecznościowe. (B-010)
- Zaawansowane rekomendacje/personalizacja. (B-011)
- Przechowywanie surowych plików PDF / baza wektorowa. (B-012)
- Rozbudowany formularz zgłaszania błędów (tylko mailto/webhook). (B-013)

Ograniczenia techniczne:

- Model LLM i jego parametry są do wyboru po PoC; w MVP należy zaimplementować
  abstrakcję i fallback. (B-014)
- SLA ręcznej weryfikacji nie jest ustalony (do decyzji produktowej). (B-015)

## 4.1 Architektura techniczna

Decyzja architektoniczna dla MVP opiera się na optymalizacji kosztów hostingu:

- **Frontend**: Next.js 15 w trybie hybrydowym - większość stron generowana
  statycznie (SSG) 2× dziennie po zakończeniu ingestu, z dodatkowymi API routes
  dla dynamicznych funkcji admina. Statyczne strony hostowane na Vercel CDN, API
  routes jako serverless functions. (ARCH-001)
- **Backend**: Python script uruchamiany przez cron na Seohost, odpowiedzialny
  za ingest, przetwarzanie LLM i zapis do bazy danych. Po zakończeniu
  triggerjuje Vercel webhook dla rebuildu frontendu. (ARCH-002)
- **Admin API**: Next.js API Routes (serverless) dla edycji treści przez
  admina - minimalna powierzchnia API, tylko update aktów + trigger rebuildu.
  (ARCH-003)

Korzyści tego podejścia:

- Znacząco niższe koszty hostingu - 95% ruchu to statyczne pliki z CDN
  (tanie/darmowe).
- Oddzielenie odpowiedzialności: Python script odpowiada za ingest i
  przetwarzanie, frontend Next.js za prezentację i proste API admina.
- Lepsza wydajność - statyczne pliki serwowane z CDN.
- Brak konieczności osobnego backendu API - Next.js API routes wystarczają dla
  MVP.
- Wszystko w jednym repozytorium frontendu (łatwiejsze w utrzymaniu).

Ograniczenia:

- Dane na frontendzie są odświeżane tylko 2× dziennie (akceptowalne dla MVP).
- Edycja admina wymaga rebuildu frontendu (2-5 min) - akceptowalne dla MVP.
- Limit odczytów w localStorage można łatwo ominąć - akceptowalne dla MVP.

## 5. Historyjki użytkowników

Uwaga: poniżej wszystkie niezbędne historyjki użytkownika, pogrupowane według
ról. Każda historyjka zawiera unikalny identyfikator (US-xxx), opis i kryteria
akceptacji. Wszystkie historyjki są testowalne.

---

### Rola: Anonimowy użytkownik / odwiedzający

US-001 Tytuł: Przeglądanie listy aktów (anonim) Opis: Jako anonimowy użytkownik
chcę zobaczyć listę najnowszych aktów z krótkimi podsumowaniami (kafelki), aby
szybko ocenić, co jest nowe. Kryteria akceptacji:

- Po wejściu na stronę główną wyświetla się lista kafelków uporządkowana
  malejąco według daty publikacji.
- Każdy kafelek zawiera tytuł, datę, krótki snippet.
- Lista generowana statycznie podczas build (SSG, dane z Prisma).
- Testowalne: otworzyć stronę główną, sprawdzić czy lista jest widoczna i
  posortowana malejąco po dacie.

US-002 Tytuł: Otwieranie widoku szczegółowego aktu (anonim) Opis: Jako anonimowy
użytkownik chcę otworzyć widok szczegółowy aktu, zobaczyć streszczenie i link do
oryginału. Kryteria akceptacji:

- Kliknięcie kafelka otwiera modal, a URL jest aktualizowany do `/?eli={eli}` z
  pełnym streszczeniem, sekcją wpływu i linkiem do PDF.
- Jeśli brak danych o głosowaniach, UI pokazuje komunikat "dane o głosowaniu
  niedostępne".

US-003 Tytuł: Limit odczytów dla anonimów Opis: Jako anonimowy użytkownik mogę
przeczytać 3 pełne streszczenia; po przekroczeniu limitu nie mogę otwierać
kolejnych i widzę komunikat z możliwością zalogowania. Kryteria akceptacji:

- System zlicza odczyty w localStorage (client-side, łatwe do obejścia).
- Po przekroczeniu limitu UI pokazuje komunikat: "Wykorzystano limit 3
  bezpłatnych odczytów. Zaloguj się, aby kontynuować bez ograniczeń."
- Testowalne: otworzyć 4 akty i na 4. zobaczyć komunikat blokujący.

US-004 Tytuł: Zgłoszenie problemu (anonim) Opis: Jako anonimowy użytkownik chcę
móc zgłosić problem z danym streszczeniem, aby administratorzy mogli to
sprawdzić. Kryteria akceptacji:

- Pod każdym streszczeniem jest przycisk "Zgłoś problem" otwierający
  pre-wypełnioną wiadomość mailto z tematem zawierającym ID aktu i tytuł.
- Format: mailto:admin@cosiedziejepolsce.pl?subject=Problem z aktem [ID] -
  [tytuł]&body=Opis problemu:
- Testowalne: kliknięcie uruchamia klienta email z poprawnymi polami.

---

### Rola: Zalogowany użytkownik (user)

US-005 Tytuł: Rejestracja i logowanie (opcjonalne) Opis: Jako użytkownik chcę
się zarejestrować i zalogować (Clerk), aby uzyskać rozszerzony dostęp do treści.
Kryteria akceptacji:

- Możliwość rejestracji/loginu przez Clerk (SSO/email); po zalogowaniu otrzymuję
  sesję zarządzaną przez Clerk (client-side).
- Testowalne: przeprowadzić logowanie i sprawdzić że Clerk zwraca
  user.isSignedIn=true oraz rolę w metadanych.

US-006 Tytuł: Zwiększony dostęp dla zalogowanych Opis: Jako zalogowany
użytkownik chcę mieć brak limitu odczytów, aby czytać więcej streszczeń.
Kryteria akceptacji:

- Po zalogowaniu przez Clerk licznik localStorage nie jest sprawdzany
  (sprawdzenie po stronie client-side czy user.isSignedIn).
- Testowalne: zalogowany użytkownik otwiera > 10 aktów bez komunikatu
  blokującego.

---

### Rola: Administrator / Superadmin

US-008 Tytuł: Edycja aktów przez admina Opis: Jako admin chcę móc edytować treść
streszczeń bezpośrednio na stronie aktu, aby poprawiać błędy i niedokładności.
Kryteria akceptacji:

- Admin (rola w Clerk) otwierając akt widzi textarea z edytowalną treścią
  zamiast statycznego tekstu.
- Przycisk "Zapisz" wywołuje POST /api/admin/update-act z nową treścią.
- API route waliduje rolę admin (Clerk), aktualizuje bazę danych (Prisma/raw
  SQL) i triggeruje Vercel rebuild webhook.
- Jeśli edytowany był akt o niskiej pewności, po zapisie jego `confidence_score`
  jest ustawiany na maksymalną wartość (np. 9.99), co czyni go widocznym dla
  wszystkich użytkowników.
- Po zapisie admin widzi komunikat "Zapisano. Rebuild w toku (~2-5 min)".
- Testowalne: admin zmienia treść, zapisuje, sprawdza DB że zaktualizowane.

US-009 Tytuł: Next.js API route dla edycji admina Opis: Jako system chcę
udostępnić API endpoint dla aktualizacji aktów przez admina, zabezpieczony
autoryzacją Clerk. Kryteria akceptacji:

- Endpoint POST /api/admin/update-act przyjmuje { actId, content }.
- Walidacja: sprawdzenie roli admin w Clerk (auth() helper z @clerk/nextjs).
- Aktualizacja bazy: użycie Prisma lub raw SQL do update contentu.
- Trigger rebuildu: wywołanie Vercel Deploy Hook webhook.
- Zwrot: { success: true, message: "Updated, rebuild triggered" }.
- Testowalne: POST z tokenem admina → success, POST bez tokena → 401, POST z
  user (nie admin) → 403.

US-012 Tytuł: Badge dla aktów niskiej pewności (Admin) Opis: Jako admin chcę
widzieć ostrzeżenie przy aktach o niskiej pewności AI, aby wiedzieć że
streszczenie wymaga weryfikacji. Kryteria akceptacji:

- Akty z confidence_score < threshold (np. 0.50) mają widoczny badge informujący
  o niskim zaufaniu.
- Badge jest widoczny tylko dla admina, zarówno na liście (kafelek) jak i w
  modalu szczegółów.
- Testowalne: utworzyć akt z confidence_score 0.30, zalogować się jako admin i
  sprawdzić że badge jest widoczny.

US-013 Tytuł: Powiadomienia o niskim confidence (admin) Opis: Jako admin chcę
otrzymywać powiadomienia (email) o wpisach z confidence_score < threshold, aby
móc je szybko zweryfikować. Kryteria akceptacji:

- Python script wysyła email (SMTP/SendGrid) dla każdego rekordu z
  confidence_score < threshold podczas ingestu.
- Email zawiera: ID aktu, tytuł, confidence_score, link do edycji.
- Threshold konfigurowalny w .env (domyślnie 0.50).
- Testowalne: utwórz wpis z confidence_score 0.20 i potwierdź wysłanie email.

---

### Rola: System / Operacje

US-014 Tytuł: Harmonogram ingestów 2× dziennie Opis: Jako operator systemu chcę,
aby pipeline ingest uruchamiał się dwa razy dziennie automatycznie. Kryteria
akceptacji:

- Cron uruchamia job o skonfigurowanych godzinach;
- Testowalne: symulacja cron run i sprawdzenie nowych rekordów/metryk.

US-015 Tytuł: Retry/backoff przy błędach ingestu Opis: Jako operator chcę, aby
pipeline retryował błędy transientne z backoffem, aby zwiększyć odporność.
Kryteria akceptacji:

- Job ponawia próbę N razy z rosnącym opóźnieniem; po wyczerpaniu retry oznacza
  rekord jako failed i generuje alert.
- Testowalne: wymuś błąd network i potwierdź retry oraz alert.

---

### Scenariusze alternatywne i skrajne (edge cases)

US-018 Tytuł: Brak linku do PDF w danych Opis: Jako system chcę oznaczyć rekord
z brakującym linkiem do PDF i skierować go do reprocessingu oraz admina.
Kryteria akceptacji:

- Rekord z file IS NULL otrzymuje flagę needs_reprocess=true; widoczny w kolejce
  admina; automatyczny reprocessing przy kolejnym uruchomieniu crona.
- Testowalne: ingest z pustym file tworzy rekord z needs_reprocess=true.

US-019 Tytuł: Brak danych o głosowaniu Opis: Jako system chcę oznaczyć rekord,
dla którego brak danych o głosowaniu, aby admin mógł podjąć decyzję. Kryteria
akceptacji:

- Rekord z votes IS NULL otrzymuje flagę needs_reprocess=true; UI pokazuje
  komunikat "dane o głosowaniu niedostępne" oraz umożliwia automatyczny
  reprocessing przy kolejnym cronie.
- Testowalne: ingest bez danych głosowania (votes IS NULL) ustawia
  needs_reprocess=true i widoczne w UI.

US-021 Tytuł: Kolejkowy reprocessing aktów Opis: Jako system chcę automatycznie
ponownie przetwarzać akty z błędami przy kolejnych uruchomieniach crona, aby
zapewnić kompletność danych. Kryteria akceptacji:

- Akty z błędami (brakujące dane: file IS NULL, votes IS NULL, content IS NULL,
  lub błędy LLM) otrzymują flagę needs_reprocess=true.
- Przy każdym uruchomieniu crona (2×/dzień) najpierw przetwarzane są akty z
  needs_reprocess=true, potem nowe.
- Po udanym reprocessingu flaga needs_reprocess ustawiana na false.
- Testowalne: utwórz akt z needs_reprocess=true, uruchom cron, sprawdź czy
  został przetworzony i flaga ustawiona na false.

US-023 Tytuł: Fallback LLM i retry Opis: Jako system chcę mechanizm fallbacku
gdy model LLM nie odpowiada (inny model / ponowna próba), aby pipeline był
bardziej odporny. Kryteria akceptacji:

- W przypadku błędu modelu, pipeline próbuje fallback_model lub retry; jeśli
  nadal nieudane, wpis oznaczany flagą needs_reprocess=true, zapisywany w bazie
  z NULL w polach content/simple_title/impact_section, i admin powiadamiany.
- Testowalne: symulacja błędu LLM i potwierdzenie needs_reprocess=true oraz
  email do admina.

---

## 6. Metryki sukcesu

Metryki techniczne i biznesowe do monitorowania w MVP:

1. Aktywność użytkowników (biznesowa):

- DAU (dzienne unikalne użytkownicy) / tygodniowi unikalni użytkownicy.
- Liczba odsłon widoków szczegółowych ustaw.
- Cel początkowy: ustalić baseline w pierwszym miesiącu; docelowe wartości
  wymagają decyzji produktowej.

2. Stabilność ingestu (operacyjna):

- Success rate ingestów (procent poprawnie przetworzonych rekordów) — cel: > 95%
  (do potwierdzenia).
- % rekordów z brakującymi danymi (file IS NULL, votes IS NULL, content IS NULL)
  — monitorować tygodniowo.
- Średni czas reprocessingu dla brakujących danych (target: automatyczny
  reprocessing przy następnym cronie, max 12h). (Mierzalne metryki:
  avg_time_to_reprocess = różnica między created_at a ingested_at dla rekordów
  gdzie needs_reprocess został ustawiony na false)
- Liczba aktów w kolejce reprocessingu (needs_reprocess=true).

3. Jakość streszczeń (produktowa):

- % streszczeń z confidence_score < threshold (np. 0.50) → wyświetlanych z badge
  ostrzegawczym i objętych powiadomieniami email do admina. (Monitorować trend
  spadkowy - cel: < 10% aktów)
- Liczba cofkniętych/edytowanych opublikowanych streszczeń przez admina (jako
  wskaźnik hallucination/błędów LLM) - mierzone przez porównanie updated_at >
  created_at + 1h.

4. Bezpieczeństwo i zgodność:

- Liczba incydentów nieautoryzowanego dostępu (0 jako aspiracja).
- Czas reakcji na krytyczne alerty ingestu (SLA operacyjny, do ustalenia).

5. UX / adopcja:

- Procent anonimów konwertujących do zalogowanych (np. po wyświetleniu
  informacji o limicie).
- Średni czas spędzony na stronie przy czytaniu streszczenia (engagement).

Sposób zbierania metryk:

- Instrumentacja backendu (Prometheus / inny monitoring) + dashboard (Grafana)
  do realtime metriców.
- Logi akcji adminów i użytkowników (audit_log) do analizy jakości.

---

Kontrola jakości PRD (lista kontrolna):

- Każda historyjka ma kryteria akceptacji testowalne: TAK (opisane powyżej).
- Kryteria akceptacji są konkretne i mierzalne: TAK (HTTP status, pola API,
  progi, liczby, czas).
- Historia uwzględnia uwierzytelnianie/autoryzację: TAK (US-005, US-008).
- Czy wystarczająca liczba historyjek, aby zbudować MVP: TAK (ingest,
  prezentacja, admin, auth, operacje, edge cases).

Nierozwiązane decyzje wymagające dalszych decyzji produktowych (dołączyć do
backlogu):

- Dokładne progi confidence (threshold) i proces SLA manualnej weryfikacji.
- Wybór konkretnego modelu LLM oraz budżet na API i fallback.
- Dokładne godziny cronów i parametry retry/backoff.
- Konkretne KPI liczbowe (DAU, retention) do celów biznesowych.
- Polityka prawna / disclaimer za streszczenia (treść i odpowiedzialność).

---

## 7. Stos technologiczny (Tech Stack)

### Frontend:

- **Next.js 15** - framework, tryb hybrydowy (SSG + API routes)
- **TypeScript 5** - typowanie
- **React 19** - UI library
- **Tailwind CSS 4** - stylowanie
- **Shadcn UI** - komponenty UI
- **Clerk** - autentykacja i autoryzacja (role: user, admin)
- **Prisma 6** - ORM do odczytu danych podczas build time (SSG)

### Backend (Python Script):

- **Python 3.x** - język
- **Requests/httpx** - HTTP client do API rządowego
- **OpenAI SDK** - integracja z OpenAI API
- **SQLAlchemy / raw SQL** - zapis do bazy danych
- **SMTP/SendGrid** - email notyfikacje dla admina

### Baza danych:

- **Neon DB** - serverless PostgreSQL

### CI/CD i Hosting:

- **GitHub Actions** - CI/CD
- **Seohost** - hosting Python script + cron (2×/dzień)
- **Vercel** - hosting Next.js (SSG + serverless functions)

### Komunikacja między komponentami:

- Python script → Neon DB (zapis aktów po ingestcie)
- Python script → Vercel Webhook (trigger rebuildu)
- Next.js build time → Neon DB (Prisma odczyt dla SSG)
- Next.js API routes → Neon DB (admin edycja)
- Next.js API routes → Vercel Webhook (trigger rebuildu po edycji)

### Ograniczenia MVP:

- Limit odczytów tylko w localStorage (łatwe obejście - akceptowalne)
- Rebuild frontendu po edycji admina trwa 2-5 min (akceptowalne)
- Brak real-time updates (aktualizacja co 12h przez cron - akceptowalne)

---

## 8. Szczegóły struktury bazy danych

### Tabela: acts

Główna tabela przechowująca akty prawne i ich streszczenia.

**Metadane aktów:**

- `id` - unikalny identyfikator (auto-increment)
- `title` - oryginalny tytuł aktu
- `act_number` - numer aktu
- `simple_title` - uproszczony tytuł
- `item_type` - typ dokumentu (ustawa, rozporządzenie, etc.)
- `announcement_date` - data ogłoszenia
- `change_date` - data zmiany
- `promulgation` - data promulgacji
- `item_status` - status aktu
- `comments` - komentarze
- `keywords` - słowa kluczowe (array)
- `refs` - referencje do innych aktów (JSON)
- `texts` - teksty/fragmenty (JSON)
- `file` - URL do pliku PDF

**Streszczenia generowane przez LLM:**

- `content` - pełne streszczenie
- `impact_section` - sekcja "Jak to wpływa na obywatela"
- `confidence_score` - pewność modelu (0.00-9.99)

**Dane dodatkowe:**

- `votes` - informacje o głosowaniu (JSON)
- `category` - przypisana kategoria

**Pola operacyjne:**

- `idempotency_key` - klucz zapobiegający duplikatom
- `needs_reprocess` - flaga wymagająca ponownego przetworzenia
- `created_at` - data utworzenia
- `updated_at` - data ostatniej aktualizacji
- `ingested_at` - data pomyślnego przetworzenia

**Reguły biznesowe:**

- Akty z `confidence_score < 0.50` są widoczne tylko dla admina
- Akty z `needs_reprocess = true` są przetwarzane priorytetowo
- Brakujące dane (file, votes, content) triggerują reprocessing

### Tabela: category

Słownik kategorii do automatycznej kategoryzacji aktów.

**Struktura:**

- `id` - unikalny identyfikator (auto-increment, PK)
- `category` - nazwa kategorii
- `keywords` - słowa kluczowe powiązane z kategorią (JSON)

**Użycie:**

- Backend dopasowuje kategorie na podstawie słów kluczowych
- Kategoria zapisywana w polu `category` tabeli acts

### Tabela: keywords

Słownik słów kluczowych.

**Struktura:**

- `keyword` - słowo kluczowe (PK)
