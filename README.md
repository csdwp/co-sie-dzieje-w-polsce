# Co się dzieje w Polsce?

[![Project Status: WIP](https://img.shields.io/badge/status-work_in_progress-yellow.svg)](https://github.com/rurek/co-sie-dzieje-w-olsce)

## Spis treści

- [Opis projektu](#opis-projektu)
- [Stos technologiczny](#stos-technologiczny)
- [Uruchomienie lokalne](#uruchomienie-lokalne)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Dostępne skrypty](#dostępne-skrypty)
- [Zakres projektu](#zakres-projektu)
- [Status projektu](#status-projektu)
- [Licencja](#licencja)

## Opis projektu

"Co się dzieje w Polsce?" to platforma obywatelska, która dostarcza jasne i
przystępne streszczenia najważniejszych ustaw i rozporządzeń publikowanych w
Polsce. System pobiera metadane aktów prawnych z rządowego API, generuje
uproszczone podsumowania za pomocą modeli LLM i prezentuje je użytkownikom wraz
z linkami do oryginalnych dokumentów PDF.

Celem MVP jest dostarczenie stabilnej, funkcjonalnej aplikacji do przeglądania i
czytania uproszczonych streszczeń aktów prawnych, z prostą kontrolą dostępu,
edycją treści przez administratora oraz zapleczem operacyjnym do ponownego
przetwarzania brakujących danych.

## Stos technologiczny

### Frontend

- **Framework**: Next.js 15 (SSG + API routes)
- **Język**: TypeScript 5
- **Biblioteka UI**: React 19
- **Stylowanie**: Tailwind CSS 4
- **Komponenty UI**: Shadcn UI
- **Uwierzytelnianie**: Clerk
- **ORM**: Prisma 6 (tylko w czasie budowania)

### Backend

- **Język**: Python 3.10+
- **Integracja API**: OpenAI SDK
- **Połączenie z bazą danych**: psycopg2 (PostgreSQL)
- **Powiadomienia e-mail**: smtplib

### Baza danych

- **Usługa**: Neon DB (PostgreSQL)

## Uruchomienie lokalne

### Wymagania wstępne

- Node.js (wersja określona w pliku `.nvmrc`)
- pnpm
- Python 3.10+
- `pip` i `venv`

### Frontend

1.  **Przejdź do katalogu `frontend`**:
    ```bash
    cd frontend
    ```
2.  **Zainstaluj zależności**:
    ```bash
    pnpm install
    ```
3.  **Skonfiguruj zmienne środowiskowe**: Utwórz plik `.env.local` i dodaj
    niezbędne zmienne środowiskowe (np. connection string do bazy danych, klucze
    API Clerk).
4.  **Uruchom serwer deweloperski**:
    ```bash
    pnpm dev
    ```

### Backend

1.  **Przejdź do katalogu aplikacji backendowej**:
    ```bash
    cd backend/app
    ```
2.  **Utwórz i aktywuj wirtualne środowisko**:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  **Zainstaluj zależności**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Skonfiguruj zmienne środowiskowe**: Utwórz plik `.env` i dodaj niezbędne
    zmienne (np. connection string do bazy danych, klucz API OpenAI).
5.  **Uruchom główny skrypt**:
    ```bash
    python main.py
    ```

## Dostępne skrypty

W katalogu `frontend` możesz uruchomić następujące skrypty:

- `pnpm dev`: Uruchamia serwer deweloperski.
- `pnpm build`: Buduje aplikację do wersji produkcyjnej.
- `pnpm start`: Uruchamia serwer produkcyjny.
- `pnpm lint`: Sprawdza kod pod kątem błędów.
- `pnpm lint:fix`: Sprawdza i naprawia błędy w kodzie.
- `pnpm format`: Formatuje kod za pomocą Prettier.
- `pnpm format:check`: Sprawdza formatowanie kodu.

## Zakres projektu

### W ramach MVP

- Rejestracja i logowanie użytkowników (Clerk) z rolami `user` i `admin`.
- Lista aktów prawnych z krótkimi streszczeniami.
- Limit dostępu dla anonimowych użytkowników (3 odczyty, śledzone w
  `localStorage`).
- Panel administratora do edycji treści za pomocą `textarea` i API route.
- Pobieranie danych uruchamiane dwa razy dziennie, pobierające dane i linki do
  PDF.
- Akty o niskim wskaźniku pewności są widoczne tylko dla administratorów.
- Prosty mechanizm zgłaszania problemów za pomocą `mailto`.

### Poza MVP

- System płatności/subskrypcji.
- Generowanie treści na media społecznościowe.
- Zaawansowane rekomendacje/personalizacja.
- Przechowywanie surowych plików PDF lub użycie wektorowej bazy danych.
- Zaawansowany formularz zgłaszania błędów.

## Status projektu

Projekt jest obecnie w trakcie realizacji **(Work in Progress - WIP)**. Główne
funkcjonalności są w fazie rozwoju, a platforma nie jest jeszcze gotowa do
użytku produkcyjnego.

## Licencja

Ten projekt jest objęty licencją MIT. Więcej szczegółów znajdziesz w pliku
`LICENSE`.
