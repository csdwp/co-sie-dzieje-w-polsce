<conversation_summary> <decisions>

Długość i format streszczeń będą adaptowalne — heurystyka (rozmiar/typ ustawy)
decyduje: małe zmiany → TL;DR, średnie → punkty + kogo dotyczy, duże →
rozbudowana struktura.

Logowanie będzie opcjonalne — anonimowe przeglądanie domyślne; konta umożliwią
dostęp do większej ilości ustaw i funkcji.

Ingest będzie uruchamiany 2 razy dziennie (cron).

Model LLM powinien „rozumować”, ale kwestia ręcznej weryfikacji streszczeń
pozostaje nierozwiązana i wymaga workflowu.

Dwa przypadki workflow admina: (A) ustawa niepodejrzana — widoczna dla
użytkowników, admin może poprawić błędy jeśli występują; (B) ustawa podejrzana —
widoczna tylko dla admina. Sam fakt zapisu zmian przez admina czyni ją widoczną
dla wszystkich użytkowników i usuwa oznaczenie „podejrzana”.

Na etapie MVP nie przechowujemy pełnych tekstów i PDF-ów — jedynie linki do PDF
w rządowym API; baza wektorowa i przechowywanie surowych dokumentów planowane na
późniejsze iteracje.

Główny cel biznesowy prosty: żeby ludzie korzystali z aplikacji (brak
rozbudowanych KPI wskazanych na teraz).

Role uproszczone: tylko admin i user; zarządzanie uprawnieniami odbywa się przez
zewnętrzny panel (Clerk).

Mechanizm zgłaszania błędów nie będzie w MVP — ewentualnie prosty mail/webhook
jako tymczasowe rozwiązanie; pod streszczeniem będzie link do oryginalnego PDF.

Najbliższe 2 tygodnie priorytetem: testy backendu i łatanie krytycznych dziur
(m.in. brak PDFów lub brak danych o głosowaniu — wymóg reprocessingu).

</decisions>

<matched_recommendations>

Przygotować szablony streszczeń (TL;DR / szybkie punkty / rozbudowana struktura)
i parametr „verbosity” dla promptów LLM — zgodne z decyzją o adaptacyjnym
formacie.

Pozwolić na anonimowe przeglądanie + zarezerwować dodatkowe funkcje dla
zalogowanych użytkowników — zgodne z decyzją o opcjonalnym logowaniu.

Zaprojektować kolejkę ingestową z idempotency key, retry/backoff i alertami —
pasuje do decyzji o 2× dziennie cron oraz potrzeby reprocessingu.

Wprowadzić workflow oznaczania „podejrzanych” artykułów (kolejka do admina) z
draft/review/publish i audytem — dopasowane do dwóch przypadków admina.

W MVP przechowywać minimalne metadane (source_id, url_pdf, ingest_timestamp,
checksum, status) i implementować job do ponownego pobrania brakujących PDFów —
zgodne z decyzją nieprzechowywania pełnych tekstów na MVP.

Dla MVP użyć prostego mechanizmu zgłoszeń (mailto/webhook) i zbierać metadane
zgłoszeń, żeby potem dodać formularz w aplikacji — zgodne z decyzją o odłożeniu
formularza bug report.

Zarezerwować sprint stabilizacyjny na naprawę backendu (testy
jednostkowe/integracyjne, CI, monitoring) przed rozwojem nowych funkcji —
odpowiada priorytetom na 2 tygodnie.

Dodanie pola „confidence/score” w outputach LLM i routowanie niskiego confidence
do ręcznej weryfikacji — rekomendacja dopasowana do potrzeby manualnej
weryfikacji streszczeń. </matched_recommendations>

<prd_planning_summary> a. Główne wymagania funkcjonalne (MVP)

Pipeline ingest: poll rządowego API 2× dziennie → pobranie metadanych i linku do
PDF → parsowanie metadanych → wysłanie tekstu do LLM → otrzymanie streszczenia z
parametrem verbosity.

Prezentacja: strona główna z kafelkami ustaw, widok szczegółowy ze streszczeniem
i linkiem do oryginalnego PDF.

Autoryzacja: opcjonalne logowanie (Clerk) — role: user i admin.

Panel admina: przegląd ustaleń, kolejka „podejrzanych”, możliwość edycji i
zatwierdzania (draft → approve → publish), historia zmian/audit log.

Metadane storage: przechowywanie minimalnych metadanych (source_id, url_pdf,
ingest_timestamp, checksum, status, LLM_confidence).

Operacje utrzymania: ręczny re-ingest brakujących PDFów, retry/backoff przy
błędach ingestu, alerty operacyjne.

Prosty mechanizm raportowania problemów (mailto/webhook) jako tymczasowe
rozwiązanie.

b. Kluczowe historie użytkownika i ścieżki korzystania

Anonymous user: odwiedza stronę → klika kafelek ustawy → czyta streszczenie →
(opcjonalnie) klika link do oryginału.

Zalogowany user: jak anonim, plus dostęp do większej puli ustawy (funkcja
premium) / filtrowania (planowane po MVP).

Admin: otrzymuje powiadomienia o nowych ingestach i elementach oznaczonych jako
„podejrzane” → przegląda auto-generated summary + score → edytuje i zatwierdza
albo odrzuca/aktualizuje → publikuje zmianę (audit log).

Operacje na backendzie: cron job uruchamia ingest 2× dziennie; joby
retry/backoff; ręczny reprocess dla rekordów z brakującymi PDFami lub
brakującymi danymi o głosowaniu.

c. Ważne kryteria sukcesu i sposoby ich mierzenia

Podstawowy wskaźnik biznesowy: aktywne użycie aplikacji (prosty KPI: DAU lub
unikalni użytkownicy / odsłony ustaw). Mierzyć tygodniowo.

Stabilność systemu: brak krytycznych błędów ingestu przekraczających X% (ustalić
próg), obecność automatycznych alertów dla failed ingestów.

Jakość generowanych streszczeń: procent summary z confidence < próg (np. <0.5)
trafiających do kolejki ręcznej — monitorować i zmniejszać w iteracjach.

Operacyjny SLA: zdolność do ponownego przetworzenia rekordów z brakującymi
PDFami w określonym oknie (np. re-ingest job wykonany w ciągu 24–48h od
pojawienia się PDF). (Uwaga: konkretne targety numeryczne wymagają decyzji
właściciela produktu.)

d. Nierozwiązane kwestie / wymagania do doprecyzowania

Dokładne progi confidence/score LLM (które uruchamiają manualną weryfikację) i
kto ustala te progi.

Mechanika i SLA ręcznej weryfikacji (kto weryfikuje, czas reakcji — np.
24h/48h).

Konkretne godziny cronów (zależnie od okna publikacji rządowego API) i polityka
retry/backoff (parametry).

Wybór konkretnego modelu LLM (koszty, dostępność modelu „rozumującego”, limit
tokenów) oraz budżet na API; fallback w przypadku błędów modelu.

Polityka prawna / disclaimer za streszczenia (odpowiedzialność, konieczność
konsultacji prawnej).

Deklarowane KPI i wartości progowe (DAU, retention itp.) — obecnie cel to
„użycie aplikacji”, wymaga konkretów.

Dokładny proces reprocessingu, gdy po pierwszym ingest brakuje PDFu lub danych o
głosowaniu — kto inicjuje i jak oznaczać ponowne przetworzenie.

Plan migracji do przechowywania surowych tekstów i bazy wektorowej (timeline i
kryteria decyzji).

Sposób mapowania ról Clerk → aplikacja (synchronizacja, tokeny, odwołanie
dostępu).

</prd_planning_summary>

<unresolved_issues>

Brak decyzji o progu confidence LLM i ostatecznym mechanizmie routowania
niskiego confidence do manualnej weryfikacji.

Nieustalone SLA i odpowiedzialność za ręczną weryfikację (czas reakcji, role,
priorytety).

Nieokreślony wybór modelu LLM (koszty i parametry ograniczające hallucinationy)
— wymaga RfP/PoC.

Konkretne czasy uruchamiania cronów i parametry retry/backoff dla ingestu.

Brak zdefiniowanych mierników adopcji (konkretne KPI i cele numeryczne).

Brak decyzji prawnej dotyczącej disclaimera i odpowiedzialności za nieścisłości
w streszczeniach.

Szczegóły procesu reprocessingu przy pojawieniu się brakujących PDFów lub
brakujących informacji o głosowaniach.

Plan i kryteria migracji do przechowywania pełnych tekstów / wektorowej bazy
wiedzy (kiedy i jak). </unresolved_issues> </conversation_summary>
