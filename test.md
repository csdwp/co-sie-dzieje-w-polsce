# Backend Testing Analysis — Test Coverage Report

## Executive Summary

Backend projektu "Co się dzieje w Polsce?" ma **niewystarczające pokrycie
testami**. Testowane są głównie warstwy perimetralne (konfiguracja, wyjątki,
walidatory), natomiast **core business logic nie ma żadnych unit testów**.

---

## 1. Co jest TESTOWANE ✅

### 1.1 Core Configuration (`backend/tests/unit/test_core/test_config.py`)

- **Status:** Dobrze przetestowane
- **Test Count:** 4 testy
- **Zakres:**
  - ✅ Walidacja obecności wymaganych zmiennych środowiskowych
  - ✅ Sprawdzenie `REQUIRED_ENV_VARS` (BASIC_URL, DU_URL, DATABASE_URL,
    OPENAI_API_KEY)
  - ✅ Handling brakujących sekretów
  - ✅ Inicjalizacja konfiguracji

**Kod testowany:**

```python
# core/config.py
REQUIRED_ENV_VARS = ["BASIC_URL", "DU_URL", "DATABASE_URL", "OPENAI_API_KEY"]

def check_environment() -> bool:
    missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
    if missing_vars:
        print(f"ERROR: Missing environment variables: {', '.join(missing_vars)}")
        return False
    return True
```

### 1.2 Exception Hierarchy (`backend/tests/unit/test_core/test_exceptions.py`)

- **Status:** W pełni przetestowane
- **Test Count:** 6 testów
- **Zakres:**
  - ✅ `AppConfigError` — errors przy konfiguracji
  - ✅ `ExternalAPIError` — errors z zewnętrznych API
  - ✅ `DatabaseError` — errors z bazą danych
  - ✅ `AIServiceError` — errors z AI services (OpenAI)
  - ✅ `PDFProcessingError` — errors przy przetwarzaniu PDF
  - ✅ Hierarchia dziedziczenia exceptów

**Kod testowany:**

```python
# core/exceptions.py
class AppException(Exception):
    """Base application exception"""
class ExternalAPIError(AppException):
    """External API errors"""
class AIServiceError(AppException):
    """AI service errors"""
class PDFProcessingError(AppException):
    """PDF processing errors"""
```

### 1.3 Logging Setup (`backend/tests/unit/test_core/test_logging.py`)

- **Status:** Testowane
- **Zakres:**
  - ✅ Inicjalizacja loggera
  - ✅ Formatting wiadomości logów
  - ✅ Poziomy logowania (INFO, WARNING, ERROR)

### 1.4 Data Models (`backend/tests/unit/test_models/`)

- **Status:** Częściowo przetestowane
- **Test Count:** ~5 testów
- **Zakres:**
  - ✅ `ActData` dataclass — konwersja i serializacja
  - ✅ `Voting` model — struktura danych głosowania
  - ✅ `Category` model — kategorie aktów
  - ✅ Validacja typów (type hints)

**Kod testowany:**

```python
# models/act.py
@dataclass
class ActData:
    eli: str
    title: str
    type: str
    promulgation: str
    announcement_date: Optional[str] = None
    keywords: Optional[List[str]] = None
    # ... inne pola
```

### 1.5 Validators (`backend/tests/unit/test_utils/test_validators.py`)

- **Status:** Dobrze przetestowane
- **Test Count:** 12 testów
- **Zakres:**
  - ✅ `validate_eli_format()` — format ELI (teraz **FAIL dla `DU/...`**)
  - ✅ `validate_act_data()` — struktura danych aktu
  - ✅ `validate_keywords()` — format słów kluczowych
  - ✅ Edge cases (puste wartości, None, złe typy)

**Problem znaleziony:**

```python
# validators.py:25
pattern = r"^/[a-z]{2}/[a-z]+/[a-z]+/\d{4}/\d+.*$"
# ❌ Nie akceptuje DU/2026/137
# ✅ Akceptuje /pl/act/dz/2026/137
```

### 1.6 Sejm API Client (`backend/tests/unit/test_services/test_external/test_sejm_api.py`)

- **Status:** Całkiem dobrze przetestowane
- **Test Count:** 18 testów
- **Zakres:**
  - ✅ `fetch_acts_for_year()` — pobieranie aktów dla danego roku
  - ✅ `fetch_act_details()` — szczegóły pojedynczego aktu
  - ✅ `fetch_voting_process()` — dane głosowania
  - ✅ `fetch_sejm_voting()` — szczegóły głosowania
  - ✅ `get_pdf_url()` — budowanie URL do PDF
  - ✅ URL construction z różnymi parametrami
  - ✅ Error handling (HTTP errors, timeouts, invalid responses)
  - ✅ Retry logic (tenacity decorator)
  - ✅ JSON parsing

**Kod testowany:**

```python
# services/external/sejm_api.py
@retry_external_api
def _fetch_json(self, url: str) -> Optional[Union[Dict[str, Any], List[Any]]]:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()
```

### 1.7 File Operations (`backend/tests/unit/test_utils/test_file_handler.py`)

- **Status:** Testowane
- **Zakres:**
  - ✅ Odczyt/zapis plików JSON
  - ✅ Odczyt/zapis linii tekstowych
  - ✅ Error handling (missing files, corrupt data)
  - ✅ File paths management

**Kod testowany:**

```python
# utils/file_handler.py
class FileHandler:
    def read_json(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Read JSON from file"""

    def write_json(self, file_path: Path, data: Dict[str, Any]) -> bool:
        """Write JSON to file"""
```

### 1.8 Retry Handler (`backend/tests/unit/test_utils/test_retry_handler.py`)

- **Status:** Częściowo przetestowane
- **Zakres:**
  - ✅ Decorator `@retry_external_api` — retry logic
  - ⚠️ Ale testy są dla základowych przypadków

**Kod testowany:**

```python
# utils/retry_handler.py
@retry_external_api
def fetch_data(url: str):
    """Retry with exponential backoff"""
```

### 1.9 End-to-End Test (`backend/tests/e2e/test_sejm_api_integration_e2e.py`)

- **Status:** 1 comprehensive E2E test
- **Zakres:**
  - ✅ Pełny pipeline integration test
  - ✅ Rzeczywiste API Sejmu
  - ✅ Rzeczywiste OpenAI API
  - ⚠️ **UWAGA:** Test wymaga real API keys (nie uruchamiany w CI/CD)

**Test:**

```python
def test_full_pipeline_integration():
    """Test complete pipeline with real API calls"""
    # Fetch acts → Download PDF → Analyze with AI → Save to DB
```

---

## 2. Co NIE jest TESTOWANE ❌

### 2.1 Act Processor Service (`backend/app/services/act_processor.py`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** KRYTYCZNE
- **Zakres brakujący:**
  - ❌ `ActProcessor.process_act()` — główna logika przetwarzania
  - ❌ `ActProcessor._extract_text()` — ekstrakcja tekstu z PDF
  - ❌ `ActProcessor._analyze_and_categorize()` — AI analysis
  - ❌ Error handling (failed PDF, invalid act data)
  - ❌ Integration z AI services
  - ❌ Database save logic

**Kod bez testów:**

```python
class ActProcessor:
    async def process_act(self, act: Dict[str, Any]) -> Optional[Act]:
        """Process single act: PDF → Text → AI Analysis → DB Save"""
        # ❌ UNTESTED

    def _extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        # ❌ UNTESTED

    async def _analyze_and_categorize(self, text: str) -> Dict[str, Any]:
        """Analyze with OpenAI and categorize"""
        # ❌ UNTESTED
```

**Wpływ:** To jest **heart** backendu — bez testów możliwe są:

- Memory leaks przy przetwarzaniu dużych PDF-ów
- Błędy przy integracji z OpenAI
- Nieoczekiwane errory w bazie danych
- Dane w bazie niezgodne z oczekiwaniami

### 2.2 Repository Layer (`backend/app/repositories/`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** KRYTYCZNE
- **Zakres brakujący:**
  - ❌ `ActRepository.get_act()` — pobieranie aktu
  - ❌ `ActRepository.save_act()` — zapis aktu
  - ❌ `ActRepository.update_act()` — aktualizacja
  - ❌ `ActRepository.get_acts_needing_reprocess()` — lowered confidence acts
  - ❌ `CategoryRepository` — operations na kategoriach
  - ❌ Database transactions
  - ❌ Error handling (connection errors, constraint violations)
  - ❌ Query optimization

**Kod bez testów:**

```python
class ActRepository(BaseRepository):
    def save_act(self, act: Act) -> bool:
        """Save act to database"""
        # ❌ UNTESTED - Direct SQL queries

    def get_act(self, eli: str) -> Optional[Act]:
        """Fetch act by ELI"""
        # ❌ UNTESTED
```

**Wpływ:** Database operations są **nieprzetestowane**:

- Brak gwarancji że dane są poprawnie zapisywane
- Brak testów na unique constraints (`idempotency_key`)
- Brak testów na transakcje
- Brak testów na migracje danych

### 2.3 AI Services (`backend/app/services/ai/`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** WYSOKA
- **Zakres brakujący:**
  - ❌ `TextAnalyzer.analyze()` — AI text analysis
  - ❌ `TextAnalyzer.split_text()` — text chunking
  - ❌ `Categorizer.categorize()` — act categorization
  - ❌ Confidence scoring
  - ❌ Token counting (tiktoken)
  - ❌ Error handling (invalid text, API errors)
  - ❌ Retry logic dla timeout-ów

**Kod bez testów:**

```python
class TextAnalyzer:
    def analyze(self, text: str) -> str:
        """Analyze text with OpenAI"""
        # ❌ UNTESTED

    def split_text(self, text: str) -> List[str]:
        """Split long texts into chunks"""
        # ❌ UNTESTED

class Categorizer:
    def categorize(self, text: str) -> List[str]:
        """Categorize act into topics"""
        # ❌ UNTESTED
```

**Wpływ:** AI pipeline jest czarną skrzynką:

- Nie wiadomo jak się behawuje na edge cases
- Brak testów na chunking strategy
- Brak testów na prompt engineering
- Brak testów na error recovery

### 2.4 PDF Processing (`backend/app/services/external/pdf_processor.py`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** WYSOKA
- **Zakres brakujący:**
  - ❌ `PDFProcessor.download_pdf()` — pobieranie PDF
  - ❌ `PDFProcessor.extract_text()` — ekstrakcja tekstu (PyMuPDF)
  - ❌ Handling corrupt PDFs
  - ❌ Handling oversized PDFs
  - ❌ Character encoding issues
  - ❌ Timeout handling (30s)
  - ❌ Cleanup temporary files

**Kod bez testów:**

```python
class PDFProcessor:
    def download_pdf(self, url: str) -> Optional[str]:
        """Download PDF and save to temp file"""
        # ❌ UNTESTED

    def extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF using PyMuPDF"""
        # ❌ UNTESTED
```

**Wpływ:** PDF processing mogą mieć nieznane problemy:

- Memory leaks przy dużych PDF-ach
- Brak handling dla corrupted PDFs
- Brak testów na różne encodingi
- Cleanup problemy (temp files)

### 2.5 Pipeline Orchestration (`backend/app/pipeline/orchestrator.py`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** KRYTYCZNE
- **Zakres brakujący:**
  - ❌ `PipelineOrchestrator.check_for_new_acts()` — main pipeline
  - ❌ `PipelineOrchestrator.check_old_elis()` — delayed acts reprocessing
  - ❌ Act filtering logic (max 10 per run)
  - ❌ Error handling (partial failures)
  - ❌ State management (last_known.json)
  - ❌ Idempotency checks

**Kod bez testów:**

```python
class PipelineOrchestrator:
    def check_for_new_acts(self) -> None:
        """Main pipeline: Fetch → Filter → Process → Save"""
        # ❌ UNTESTED

    def check_old_elis(self) -> None:
        """Reprocess acts waiting for voting data"""
        # ❌ UNTESTED
```

**Wpływ:** Pipeline nie ma żadnych gwarancji:

- Brak testów na idempotency
- Brak testów na partial failures
- Brak testów na state consistency
- Brak testów na retry behavior

### 2.6 Act Fetcher (`backend/app/pipeline/act_fetcher.py`)

- **Status:** ⚠️ CZĘŚCIOWO
- **Importance:** WYSOKA
- **Zakres brakujący:**
  - ❌ `ActFetcher.fetch_and_filter_acts()` — filtering logic
  - ❌ `ActFetcher.identify_new_acts()` — new acts detection
  - ❌ `ActFetcher._check_voting_available()` — voting check
  - ❌ ELI format handling (teraz **BROKEN**)
  - ❌ State file management (last_known.json)

**Kod bez testów:**

```python
def fetch_and_filter_acts(self) -> List[Dict[str, Any]]:
    """Fetch and filter by type"""
    # ❌ UNTESTED - validator bug here!

def _check_voting_available(self, eli: str) -> bool:
    """Check if voting data exists"""
    # ❌ UNTESTED
```

### 2.7 Votes Services (`backend/app/services/votes_*.py`)

- **Status:** ❌ BEZ TESTÓW
- **Importance:** ŚREDNIA
- **Zakres brakujący:**
  - ❌ `VotesService.fetch_voting_data()` — data fetching
  - ❌ `VotesCalculator.calculate_voting_stats()` — vote aggregation
  - ❌ Party-by-party breakdown logic
  - ❌ Opposition calculation
  - ❌ Edge cases (missing votes, party changes)

**Kod bez testów:**

```python
class VotesCalculator:
    def calculate_voting_stats(self, voting_data: Dict) -> Dict:
        """Calculate party voting breakdown"""
        # ❌ UNTESTED
```

### 2.8 Storage Service (`backend/app/services/storage_service.py`)

- **Status:** ❌ BEZ TESTÓW
- **Zakres brakujący:**
  - ❌ Data persistence logic
  - ❌ Error handling

---

## 3. Problemy znalezione w logach i kodzie 🔴

### Problem #1: ELI Format Validator Bug

**Location:** `backend/app/utils/validators.py:25`

```python
pattern = r"^/[a-z]{2}/[a-z]+/[a-z]+/\d{4}/\d+.*$"
```

**Issue:**

- ❌ Nie akceptuje `DU/2026/137` (format zwracany przez API Sejmu w 2026)
- ✅ Akceptuje `/pl/act/dz/2026/137` (stary format)
- **Wynik:** Wszystkie 80 nowych aktów z 2026 są odrzucane
- **Root Cause:** API Sejmu zmienił format zwracanego ELI

**Log Evidence:**

```
2026-02-08 12:20:37,060 - app.utils.validators - ERROR - Invalid ELI format: DU/2026/137
2026-02-08 12:20:37,060 - app.utils.validators - ERROR - Invalid ELI format: DU/2026/135
[... 80 más ...]
2026-02-08 12:20:37,061 - app.pipeline.act_fetcher - WARNING - No legal acts meeting the criteria
```

**Fix Required:**

```python
# Accept both formats:
pattern = r"^(?:/[a-z]{2}/[a-z]+/[a-z]+/\d{4}/\d+|[A-Z]+/\d{4}/\d+).*$"
```

### Problem #2: OpenAI Quota Exceeded

**Location:** Runtime error during AI analysis

**Issue:**

- ❌ OpenAI API zwraca `Error code: 429 - insufficient_quota`
- API key brakuje funds lub quota wyczerpana
- 3 akty nie mogły być przeanalizowane

**Log Evidence:**

```
2026-02-08 12:20:42,289 - app.services.external.openai_client - ERROR - OpenAI API error: Error code: 429 - {'error': {'message': 'You exceeded your current quota...'}}
```

**Action Required:**

- Sprawdzić: https://platform.openai.com/account/billing/overview
- Dodać metody płatności lub credits
- Zweryfikować plan (Free Trial vs Paid)

### Problem #3: Empty ELI Values in State Files

**Location:** Pipeline state management

**Issue:**

- ❌ Niektóre ELI w `eli_for_later.json` mogą być puste
- Powoduje błędy `Could not fetch details for`

**Log Evidence:**

```
2026-02-08 12:20:37,075 - app.pipeline.orchestrator - INFO - Checking ELI:
2026-02-08 12:20:37,075 - app.pipeline.act_fetcher - WARNING - Could not fetch details for
```

---

## 4. Test Coverage Summary Table

| Component        | Module              | Status | Tests | Notes                               |
| ---------------- | ------------------- | ------ | ----- | ----------------------------------- |
| **Core**         | config              | ✅     | 4     | Env vars validation                 |
|                  | exceptions          | ✅     | 6     | Exception hierarchy                 |
|                  | logging             | ✅     | 3     | Logger setup                        |
| **Models**       | act                 | ✅     | 2     | Basic dataclass tests               |
|                  | voting              | ✅     | 2     | Data structure                      |
|                  | category            | ✅     | 1     | Basic tests                         |
| **Utils**        | validators          | ✅     | 12    | **BUT: ELI validator has BUG**      |
|                  | file_handler        | ✅     | 5     | File I/O                            |
|                  | retry_handler       | ⚠️     | 4     | Basic retry logic only              |
| **External**     | sejm_api            | ✅     | 18    | Good coverage                       |
| **Services**     | act_processor       | ❌     | 0     | **CRITICAL**                        |
|                  | ai (analyzer)       | ❌     | 0     | **CRITICAL**                        |
|                  | ai (categorizer)    | ❌     | 0     | **CRITICAL**                        |
|                  | pdf_processor       | ❌     | 0     | **CRITICAL**                        |
|                  | votes_service       | ❌     | 0     | **CRITICAL**                        |
|                  | votes_calculator    | ❌     | 0     | **HIGH**                            |
| **Repositories** | act_repository      | ❌     | 0     | **CRITICAL**                        |
|                  | category_repository | ❌     | 0     | **HIGH**                            |
| **Pipeline**     | orchestrator        | ❌     | 0     | **CRITICAL**                        |
|                  | act_fetcher         | ⚠️     | 0     | **BROKEN (ELI validator bug)**      |
| **E2E**          | Integration test    | ⚠️     | 1     | Requires real API keys              |
| **TOTAL**        |                     |        | ~60   | **But missing core business logic** |

---

## 5. Recommendations 🎯

### Immediate (Critical)

1. **Fix ELI validator** — akceptuj format `DU/YYYY/NNN`
2. **Fix OpenAI quota** — dodaj credits/plan płatniczy
3. **Clean up empty ELIs** — usuń puste wartości z `eli_for_later.json`

### High Priority (Next Sprint)

1. **Add unit tests for ActProcessor** — 20-30 testów
2. **Add repository tests with test database** — 15-25 testów
3. **Add AI service tests with mocked OpenAI** — 15-20 testów
4. **Add PDF processor tests** — 10-15 testów
5. **Add orchestrator tests** — 10-15 testów

### Medium Priority (Following Sprint)

1. **Add votes calculator tests** — 10 testów
2. **Improve E2E test coverage** — add more scenarios
3. **Add integration tests** — pipeline with mocked APIs
4. **Document test strategies** — for new developers

### Test Infrastructure Improvements

1. **Use pytest fixtures** — shared test database, mocked APIs
2. **Add test database** — PostgreSQL test container (Docker)
3. **Mock OpenAI API** — avoid real API calls in CI/CD
4. **Add test coverage reporting** — target 70%+ for services
5. **Add CI/CD hooks** — fail if coverage drops

---

## 6. Estimated Test Count Needed

| Category          | Current | Needed  | Total   |
| ----------------- | ------- | ------- | ------- |
| Unit Tests        | 60      | 120     | 180     |
| Integration Tests | 1       | 20      | 21      |
| E2E Tests         | 1       | 5       | 6       |
| **TOTAL**         | **62**  | **145** | **207** |

**Estimated effort:** 2-3 sprints (depends on complexity)

---

## 7. Files Analyzed

**Test Files:**

- `backend/tests/unit/test_core/test_config.py` (4 tests)
- `backend/tests/unit/test_core/test_exceptions.py` (6 tests)
- `backend/tests/unit/test_core/test_logging.py` (3 tests)
- `backend/tests/unit/test_models/test_act.py` (2 tests)
- `backend/tests/unit/test_models/test_voting.py` (2 tests)
- `backend/tests/unit/test_models/test_category.py` (1 test)
- `backend/tests/unit/test_utils/test_validators.py` (12 tests)
- `backend/tests/unit/test_utils/test_file_handler.py` (5 tests)
- `backend/tests/unit/test_utils/test_retry_handler.py` (4 tests)
- `backend/tests/unit/test_services/test_external/test_sejm_api.py` (18 tests)
- `backend/tests/e2e/test_sejm_api_integration_e2e.py` (1 test)

**Source Code Analyzed (Critical untested files):**

- `backend/app/services/act_processor.py` (❌ 0 tests)
- `backend/app/services/ai/text_analyzer.py` (❌ 0 tests)
- `backend/app/services/ai/categorizer.py` (❌ 0 tests)
- `backend/app/services/external/pdf_processor.py` (❌ 0 tests)
- `backend/app/repositories/act_repository.py` (❌ 0 tests)
- `backend/app/repositories/category_repository.py` (❌ 0 tests)
- `backend/app/pipeline/orchestrator.py` (❌ 0 tests)
- `backend/app/pipeline/act_fetcher.py` (⚠️ 0 tests, **bug found**)
- `backend/app/services/votes_service.py` (❌ 0 tests)
- `backend/app/services/votes_calculator.py` (❌ 0 tests)
- `backend/app/utils/validators.py` (⚠️ tested but **BUG found**)

---

## Conclusion

Backend jest **architekturalnie solidny** (repository pattern, service layer,
dependency injection), ale **test coverage jest niewystarczająca**. Główne
problemy:

1. ❌ **Brak testów dla core business logic** (ActProcessor, Orchestrator, AI
   services)
2. ❌ **Brak testów dla database layer** (repositories)
3. ⚠️ **Bug w ELI validatorze** powodujący że wszystkie nowe akty są odrzucane
4. ⚠️ **OpenAI quota exceeded** — blocking pipeline execution
5. ⚠️ **Empty ELI values** w state files powodujące errory

**Priority:** Najpierw naprawić validator bug, potem dodać unit tests dla
kritycznych komponentów.
