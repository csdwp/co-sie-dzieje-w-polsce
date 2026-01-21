# Plan Testów - Backend Pipeline

## 1. Przegląd Systemu

Backend aplikacji "Co się dzieje w Polsce" to system przetwarzania aktów
prawnych składający się z następujących komponentów:

### Architektura Warstwowa

- **Core Layer**: Konfiguracja, logowanie, wyjątki (`app/core/`)
- **Models Layer**: Modele danych (dataclasses) (`app/models/`)
- **Utils Layer**: Narzędzia pomocnicze (`app/utils/`)
- **Repository Layer**: Dostęp do bazy danych (`app/repositories/`)
- **Services Layer**: Logika biznesowa (`app/services/`)
- **Pipeline Layer**: Orkiestracja procesów (`app/pipeline/`)

### Główny Przepływ Danych

1. **Pobieranie**: `ActFetcher` pobiera akty z API Sejmu
2. **Identyfikacja**: Wykrywa nowe akty do przetworzenia
3. **Przetwarzanie**: `ActProcessor` orkiestruje cały pipeline:
   - Pobiera i ekstraktuje tekst z PDF
   - Analizuje tekst za pomocą AI (OpenAI)
   - Pobiera dane o głosowaniach
   - Kategoryzuje akt automatycznie
   - Zapisuje do bazy PostgreSQL

### Integracje Zewnętrzne

- **Sejm API**: Pobieranie aktów prawnych i danych o głosowaniach
- **OpenAI API**: Analiza tekstu i kategoryzacja
- **PostgreSQL**: Przechowywanie danych
- **PDF Processing**: Ekstrakcja tekstu z dokumentów PDF

## 2. Strategia Testów

### Podejście do Testowania

- **Test-Driven Development (TDD)**: Testy jednostkowe przed implementacją
- **Dependency Injection**: Wszystkie serwisy przyjmują zależności w
  konstruktorze
- **Mocking**: Izolacja komponentów przez mockowanie zależności zewnętrznych
- **Test Fixtures**: Przygotowane dane testowe dla różnych scenariuszy

### Typy Testów

#### 2.1 Testy Jednostkowe (Unit Tests)

- **Zakres**: Pojedyncze klasy i metody w izolacji
- **Cel**: Weryfikacja logiki biznesowej bez zależności zewnętrznych
- **Pokrycie**: 90%+ dla warstw Services, Utils, Models

#### 2.2 Testy Integracyjne (Integration Tests)

- **Zakres**: Interakcje między warstwami
- **Cel**: Weryfikacja współpracy komponentów
- **Pokrycie**: Repository ↔ Database, Services ↔ External APIs

#### 2.3 Testy API (API Tests)

- **Zakres**: Integracje z zewnętrznymi API
- **Cel**: Weryfikacja komunikacji z Sejm API i OpenAI
- **Metoda**: VCR.py do nagrywania i odtwarzania odpowiedzi HTTP

#### 2.4 Testy End-to-End (E2E Tests)

- **Zakres**: Kompletny pipeline od początku do końca
- **Cel**: Weryfikacja całego przepływu przetwarzania aktu
- **Środowisko**: Testowa baza danych + mockowane API zewnętrzne

#### 2.5 Testy Wydajnościowe (Performance Tests)

- **Zakres**: Czas przetwarzania aktów, zużycie pamięci
- **Cel**: Optymalizacja pipeline'u
- **Narzędzia**: pytest-benchmark, memory_profiler

#### 2.6 Testy Bezpieczeństwa (Security Tests)

- **Zakres**: Walidacja danych wejściowych, SQL injection
- **Cel**: Bezpieczeństwo aplikacji
- **Pokrycie**: Validators, Repository queries

## 3. Zakres Testów

### 3.1 Core Layer (`app/core/`)

- **config.py**: Walidacja zmiennych środowiskowych
- **logging.py**: Konfiguracja loggerów
- **exceptions.py**: Hierarchia wyjątków

### 3.2 Models Layer (`app/models/`)

- **act.py**: Walidacja modeli danych, konwersja do tuple
- **category.py**: Model kategorii
- **voting.py**: Modele danych głosowań

### 3.3 Utils Layer (`app/utils/`)

- **file_handler.py**: Operacje na plikach JSON/text
- **validators.py**: Walidacja formatów ELI i danych aktów
- **retry_handler.py**: Mechanizmy retry dla API

### 3.4 Repository Layer (`app/repositories/`)

- **base_repository.py**: Zarządzanie połączeniami DB
- **act_repository.py**: CRUD operacje na aktach
- **category_repository.py**: CRUD operacje na kategoriach

### 3.5 Services Layer (`app/services/`)

#### External Services (`app/services/external/`)

- **sejm_api.py**: Komunikacja z API Sejmu
- **openai_client.py**: Integracja z OpenAI
- **pdf_processor.py**: Przetwarzanie plików PDF

#### AI Services (`app/services/ai/`)

- **text_analyzer.py**: Analiza tekstu prawnego
- **categorizer.py**: Automatyczna kategoryzacja

#### Core Services

- **act_processor.py**: Główny orkiestrator przetwarzania
- **votes_calculator.py**: Kalkulacje statystyk głosowań

### 3.6 Pipeline Layer (`app/pipeline/`)

- **orchestrator.py**: Główny koordynator pipeline'u
- **act_fetcher.py**: Pobieranie i filtrowanie aktów
- **run_pipeline_new.py**: Punkt wejścia aplikacji

## 4. Organizacja Testów

### Struktura Katalogów

```
backend/
├── app/
│   └── [kod aplikacji]
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Konfiguracja pytest i fixtures
│   ├── unit/                       # Testy jednostkowe
│   │   ├── __init__.py
│   │   ├── test_core/
│   │   │   ├── test_config.py
│   │   │   ├── test_logging.py
│   │   │   └── test_exceptions.py
│   │   ├── test_models/
│   │   │   ├── test_act.py
│   │   │   ├── test_category.py
│   │   │   └── test_voting.py
│   │   ├── test_utils/
│   │   │   ├── test_file_handler.py
│   │   │   ├── test_validators.py
│   │   │   └── test_retry_handler.py
│   │   ├── test_repositories/
│   │   │   ├── test_act_repository.py
│   │   │   └── test_category_repository.py
│   │   ├── test_services/
│   │   │   ├── test_external/
│   │   │   │   ├── test_sejm_api.py
│   │   │   │   ├── test_openai_client.py
│   │   │   │   └── test_pdf_processor.py
│   │   │   ├── test_ai/
│   │   │   │   ├── test_text_analyzer.py
│   │   │   │   └── test_categorizer.py
│   │   │   ├── test_act_processor.py
│   │   │   └── test_votes_calculator.py
│   │   └── test_pipeline/
│   │       ├── test_orchestrator.py
│   │       └── test_act_fetcher.py
│   ├── integration/                # Testy integracyjne
│   │   ├── __init__.py
│   │   ├── test_database_integration.py
│   │   ├── test_api_integration.py
│   │   └── test_service_integration.py
│   ├── e2e/                        # Testy end-to-end
│   │   ├── __init__.py
│   │   ├── test_full_pipeline.py
│   │   └── test_error_scenarios.py
│   ├── performance/                # Testy wydajnościowe
│   │   ├── __init__.py
│   │   ├── test_pipeline_performance.py
│   │   └── test_memory_usage.py
│   ├── security/                   # Testy bezpieczeństwa
│   │   ├── __init__.py
│   │   ├── test_input_validation.py
│   │   └── test_sql_injection.py
│   ├── fixtures/                   # Dane testowe
│   │   ├── __init__.py
│   │   ├── sample_acts.json
│   │   ├── sample_voting_data.json
│   │   ├── sample_pdf_content.txt
│   │   └── mock_api_responses/
│   │       ├── sejm_api_responses.json
│   │       └── openai_responses.json
│   └── cassettes/                  # VCR.py cassettes dla API
│       ├── sejm_api/
│       └── openai_api/
├── pytest.ini                     # Konfiguracja pytest
└── requirements-test.txt           # Zależności testowe
```

### Konwencje Nazewnicze

- **Pliki testowe**: `test_[nazwa_modułu].py`
- **Klasy testowe**: `Test[NazwaKlasy]`
- **Metody testowe**: `test_[funkcjonalność]_[scenariusz]_[oczekiwany_rezultat]`
- **Fixtures**: `[nazwa_obiektu]_fixture` lub `mock_[nazwa_serwisu]`

### Przykłady Nazw Testów

```python
def test_act_processor_process_and_save_valid_act_returns_true()
def test_sejm_api_fetch_acts_for_year_invalid_year_raises_exception()
def test_text_analyzer_analyze_full_text_empty_text_returns_default_analysis()
def test_categorizer_find_or_create_category_existing_keywords_returns_existing_category()
```

## 5. Narzędzia i Biblioteki

### Framework Testowy

```python
# requirements-test.txt
pytest==7.4.3                    # Framework testowy
pytest-cov==4.1.0               # Pokrycie kodu
pytest-mock==3.12.0             # Mockowanie
pytest-asyncio==0.21.1          # Testy asynchroniczne
pytest-benchmark==4.0.0         # Testy wydajnościowe
pytest-xdist==3.3.1             # Równoległe uruchamianie testów
```

### Mockowanie i Fixtures

```python
# Mockowanie
unittest.mock                    # Wbudowane mockowanie
pytest-mock                     # Integracja z pytest
responses==0.24.1               # Mockowanie HTTP requests
freezegun==1.2.2               # Mockowanie czasu/dat

# Fixtures i dane testowe
factory-boy==3.3.0             # Fabryki obiektów testowych
faker==20.1.0                  # Generowanie danych testowych
```

### Integracje Zewnętrzne

```python
# API Testing
vcrpy==5.1.0                   # Nagrywanie/odtwarzanie HTTP
httpx==0.25.2                  # Klient HTTP dla testów

# Database Testing
pytest-postgresql==5.0.0       # Testowa instancja PostgreSQL
sqlalchemy-utils==0.41.1       # Narzędzia do testów DB
```

### Analiza Kodu

```python
# Pokrycie kodu
coverage==7.3.2                # Analiza pokrycia
pytest-html==4.1.1            # Raporty HTML

# Jakość kodu
mypy==1.7.1                    # Sprawdzanie typów
black==23.11.0                 # Formatowanie kodu
isort==5.12.0                  # Sortowanie importów
flake8==6.1.0                  # Linting
```

### Konfiguracja pytest.ini

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --verbose
    --tb=short
    --cov=app
    --cov-report=html:htmlcov
    --cov-report=term-missing
    --cov-fail-under=85
    --strict-markers
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    performance: Performance tests
    security: Security tests
    slow: Slow running tests
    external_api: Tests requiring external API access
```

### 6 Testy Bezpieczeństwa Zaawansowane

#### Dodatkowe Scenariusze

- **Penetration Testing**: Automatyczne testy penetracyjne
- **Dependency Scanning**: Skanowanie zależności pod kątem luk
- **OWASP Compliance**: Testy zgodności z OWASP Top 10

#### Narzędzia Bezpieczeństwa

```python
bandit==1.7.5              # Skanowanie bezpieczeństwa kodu
safety==2.3.5              # Sprawdzanie luk w zależnościach
semgrep==1.45.0            # Statyczna analiza bezpieczeństwa
```

### 7 Monitoring i Observability

#### Testy Monitoringu

- **Health Checks**: Testy endpointów zdrowia aplikacji
- **Metrics Collection**: Weryfikacja zbierania metryk
- **Alerting**: Testy systemów alertów

#### Narzędzia Monitoringu

```python
prometheus-client==0.19.0  # Metryki Prometheus
structlog==23.2.0          # Strukturalne logowanie
opentelemetry-api==1.21.0  # Distributed tracing
```
