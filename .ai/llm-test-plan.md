# LLM Test Plan — Backend Unit Tests

## Instrukcja dla LLM

Piszesz testy jednostkowe dla backendu projektu "Co się dzieje w Polsce". Poniżej
znajdziesz wszystko, czego potrzebujesz: konwencje, wzorce, kolejność zadań i
szczegółowe specyfikacje każdego testu.

**Zasady:**
- Pisz testy w kolejności faz (Phase 1 → 2 → 3 → 4 → 5)
- W ramach fazy pisz plik po pliku
- Po napisaniu każdego pliku uruchom `cd backend && python -m pytest <ścieżka>` i napraw błędy
- NIE modyfikuj kodu produkcyjnego (chyba że test ujawni buga — wtedy zgłoś)
- Każdy test musi przechodzić niezależnie od innych

---

## Konwencje i Wzorce

### Import
Zawsze absolutne importy z prefiksem `app.`:
```python
from app.services.votes_calculator import VotesCalculator
from app.models.act import Act
```

### Struktura pliku testowego
```python
import pytest
from unittest.mock import Mock, MagicMock, patch

from app.module.under.test import ClassUnderTest


class TestClassUnderTest:
    """Tests for ClassUnderTest."""

    # --- Fixtures ---

    @pytest.fixture
    def instance(self):
        """Create ClassUnderTest with mocked dependencies."""
        mock_dep = Mock()
        return ClassUnderTest(dependency=mock_dep)

    # --- test_method_name ---

    def test_method_success(self, instance):
        # Arrange
        ...
        # Act
        result = instance.method()
        # Assert
        assert result == expected

    def test_method_edge_case(self, instance):
        ...
```

### Nazewnictwo
- Plik: `test_<nazwa_modułu>.py`
- Klasa: `Test<NazwaKlasy>`
- Metoda: `test_<metoda>_<scenariusz>` lub `test_<metoda>_<scenariusz>_<oczekiwany_wynik>`

### Mockowanie
- Używaj `unittest.mock` (NIE `pytest-mock`)
- `@patch('app.module.path.dependency')` jako dekorator lub context manager
- `Mock()` dla prostych obiektów, `MagicMock()` gdy potrzebujesz magic methods
- `patch.dict(os.environ, {...})` dla zmiennych środowiskowych

### Asercje
- `assert result == expected`
- `assert result is None`
- `assert isinstance(result, ExpectedType)`
- `with pytest.raises(ExceptionType, match="fragment"): ...`
- `mock.assert_called_once_with(...)`, `mock.call_count == N`

### Autouse fixture
W `backend/tests/conftest.py` jest `autouse=True` fixture mockujący logger:
```python
@pytest.fixture(autouse=True)
def mock_logger():
    with patch("app.core.logging.get_logger"):
        yield
```
NIE musisz mockować loggera w swoich testach — jest mockowany globalnie.

### Uruchamianie testów
```bash
cd backend && python -m pytest tests/unit/path/test_file.py -v
```

---

## Phase 1: Pure Logic (brak zależności zewnętrznych)

### 1.1 VotesCalculator
**Plik:** `backend/tests/unit/test_services/test_votes_calculator.py`
**Moduł:** `app.services.votes_calculator.VotesCalculator`

**Konstruktor:** `VotesCalculator()` — brak zależności

**Metoda do testowania:** `process_voting_data(data: Dict, term: int = 10) -> Dict`

**Kontekst:** Metoda przyjmuje surowe dane głosowania z API Sejmu i zwraca przetworzone statystyki
z podziałem na partie. Kluczowa zmienna modułowa: `GOVERNMENT_PARTIES` (dict mapujący partie koalicji).

**Testy do napisania:**

```
TestVotesCalculator:
  test_process_voting_data_valid_data_returns_party_breakdown
    - Input: dict z kluczami "votes" (lista dict z "club", "vote")
    - Oczekiwanie: wynik zawiera klucze "parties", "summary", "government", "support_by_group"

  test_process_voting_data_empty_votes_returns_empty_result
    - Input: {"votes": []}
    - Oczekiwanie: puste statystyki (zerowe wartości)

  test_process_voting_data_missing_votes_key_returns_empty_result
    - Input: {} lub {"other": "data"}
    - Oczekiwanie: pusty wynik bez wyjątku

  test_collect_votes_by_party_groups_correctly
    - Input: votes z różnymi "club" wartościami i typami głosów ("yes", "no", "abstain", "absent")
    - Oczekiwanie: poprawne zliczenie per partia

  test_calculate_party_percentages_correct_math
    - Weryfikuj że procenty sumują się do 100% (lub bliskie)

  test_calculate_government_percentages_separates_coalition_from_opposition
    - Sprawdź że partie z GOVERNMENT_PARTIES trafiają do "government"
    - Sprawdź że pozostałe partie trafiają do "opposition"

  test_calculate_votes_support_by_group_for_against_mixed
    - Scenariusz: koalicja głosuje "za", opozycja "przeciw"
    - Scenariusz: mieszane głosy

  test_process_voting_data_single_party_all_yes
    - Edge case: jedna partia, wszystkie głosy "za"

  test_process_voting_data_all_absent
    - Edge case: wszyscy nieobecni
```

**Ważne:** Przed napisaniem testów przeczytaj `backend/app/services/votes_calculator.py`
i sprawdź dokładne nazwy kluczy w wyniku oraz wartość `GOVERNMENT_PARTIES`.

### 1.2 ActProcessor — metody prywatne (pure logic)
**Plik:** `backend/tests/unit/test_services/test_act_processor.py`
**Moduł:** `app.services.act_processor.ActProcessor`

**Na tym etapie testuj TYLKO metody prywatne które są pure functions:**

```
TestActProcessorParseDate:
  test_parse_date_valid_iso_format
    - Input: "2024-01-15"
    - Oczekiwanie: datetime(2024, 1, 15)

  test_parse_date_none_returns_none
    - Input: None
    - Oczekiwanie: None

  test_parse_date_empty_string_returns_none
    - Input: ""
    - Oczekiwanie: None

  test_parse_date_invalid_format_returns_none
    - Input: "not-a-date", "15/01/2024"
    - Oczekiwanie: None (bez wyjątku)

TestActProcessorExtractLastVoteInfo:
  test_extract_last_vote_info_valid_process_data
    - Input: dict z listą "stages" zawierającą "votings" z sitting/votingNumber
    - Oczekiwanie: tuple (sitting_number, voting_number)

  test_extract_last_vote_info_no_stages
    - Input: {} lub {"stages": []}
    - Oczekiwanie: (None, None)

  test_extract_last_vote_info_stages_without_votings
    - Input: {"stages": [{"stageName": "...", "other": "data"}]}
    - Oczekiwanie: (None, None)

  test_extract_last_vote_info_multiple_stages_returns_last_with_voting
    - Input: kilka stages, tylko ostatni ma votings
    - Oczekiwanie: dane z ostatniego voting

TestActProcessorBuildActEntity:
  test_build_act_entity_all_fields_present
    - Mockuj argumenty: act_details (ActData), analysis (str/dict), voting_details, category, pdf_url
    - Oczekiwanie: Act z prawidłowo zmapowanymi polami

  test_build_act_entity_optional_fields_none
    - Voting=None, category=None
    - Oczekiwanie: Act z None w tych polach
```

**Ważne:** Przeczytaj `backend/app/services/act_processor.py` aby poznać dokładne
sygnatury metod i struktury danych. `_parse_date` i `_extract_last_vote_info` można
wywoływać na instancji z zamockowanymi zależnościami (nie wywołują ich).

---

## Phase 2: Serwisy z mockowanymi zależnościami

### 2.1 OpenAIClient
**Plik:** `backend/tests/unit/test_services/test_external/test_openai_client.py`
**Moduł:** `app.services.external.openai_client.OpenAIClient`

**Konstruktor:** `OpenAIClient(api_key: Optional[str] = None, model: str = "gpt-3.5-turbo")`
- Bez api_key → rzuca `AIServiceError`
- Z api_key → tworzy `OpenAI(api_key=...)`

**Metody:**
- `analyze_with_prompt(text, prompt, max_tokens=1000, expect_json=False) -> Dict`
- `close() -> None`

**Testy:**

```
TestOpenAIClientInit:
  test_init_with_api_key_creates_client
    - patch('app.services.external.openai_client.OpenAI') żeby nie łączyć się z API
    - assert nie rzuca wyjątku

  test_init_without_api_key_raises_ai_service_error
    - Nie podawaj api_key, patch env żeby OPENAI_API_KEY nie istniał
    - assert pytest.raises(AIServiceError)

TestOpenAIClientAnalyze:
  test_analyze_with_prompt_returns_response_content
    - Mock client.chat.completions.create → Mock z choices[0].message.content
    - Oczekiwanie: dict z "content" key

  test_analyze_with_prompt_expect_json_parses_response
    - expect_json=True, response zawiera JSON string
    - Oczekiwanie: sparsowany dict

  test_analyze_with_prompt_api_error_raises_ai_service_error
    - Mock rzuca OpenAI APIError
    - Oczekiwanie: AIServiceError (po wyczerpaniu retry)

  test_close_calls_client_close
    - Sprawdź że close() jest wywoływane na underlying client
```

**Ważne:** Musisz patchować `app.services.external.openai_client.OpenAI` w konstruktorze
oraz odczytać jak dokładnie `analyze_with_prompt` przetwarza odpowiedź (sprawdź czy
wyciąga `.choices[0].message.content` i jak formatuje wynik).

### 2.2 PDFProcessor
**Plik:** `backend/tests/unit/test_services/test_external/test_pdf_processor.py`
**Moduł:** `app.services.external.pdf_processor.PDFProcessor`

**Konstruktor:** `PDFProcessor(download_timeout: Optional[int] = None)`

**Metody:**
- `download_pdf(url, filename="temp.pdf") -> Optional[str]` — dekorowany `@retry_external_api`
- `extract_text(pdf_path) -> str`
- `download_and_extract(url) -> str`
- `save_text(text, filename) -> bool`

**Testy:**

```
TestPDFProcessorDownload:
  test_download_pdf_success_returns_path
    - patch('app.services.external.pdf_processor.requests.get')
    - Mock response z .content = b"fake pdf bytes", .status_code=200
    - Użyj tmp_path do zapisu
    - Oczekiwanie: zwraca ścieżkę do pliku

  test_download_pdf_http_error_raises_pdf_processing_error
    - Mock response.raise_for_status() rzuca HTTPError
    - Oczekiwanie: PDFProcessingError

  test_download_pdf_timeout_raises_pdf_processing_error
    - Mock requests.get rzuca requests.Timeout
    - Oczekiwanie: PDFProcessingError (po retry)

TestPDFProcessorExtract:
  test_extract_text_valid_pdf_returns_text
    - patch('app.services.external.pdf_processor.fitz.open')
    - Mock document z pages zawierającymi .get_text() → "tekst strony"
    - Oczekiwanie: połączony tekst

  test_extract_text_empty_pdf_returns_empty_string
    - Mock document z 0 stronami
    - Oczekiwanie: ""

  test_extract_text_file_not_found_raises_pdf_processing_error
    - Mock fitz.open rzuca FileNotFoundError
    - Oczekiwanie: PDFProcessingError

TestPDFProcessorDownloadAndExtract:
  test_download_and_extract_combines_both_steps
    - patch download_pdf i extract_text na instancji
    - Oczekiwanie: wywołuje oba, zwraca tekst

TestPDFProcessorSaveText:
  test_save_text_writes_to_file
    - Użyj tmp_path
    - Oczekiwanie: plik istnieje z prawidłową treścią

  test_save_text_returns_true_on_success
```

**Ważne:** Sprawdź jak dokładnie `download_pdf` zapisuje plik (ścieżka, tryb otwarcia)
i jak `extract_text` iteruje po stronach PyMuPDF. Decorator `@retry_external_api` może
komplikować testy — jeśli retry uruchamia się wielokrotnie, upewnij się że mock rzuca
wyjątek od razu na takim poziomie który nie jest retryowany, lub patchuj sam decorator.

### 2.3 TextAnalyzer
**Plik:** `backend/tests/unit/test_services/test_ai/test_text_analyzer.py`
**Moduł:** `app.services.ai.text_analyzer.TextAnalyzer`

**Konstruktor:** `TextAnalyzer(openai_client: Optional[OpenAIClient] = None)`

**Metody:**
- `summarize_fragment(text: str) -> str`
- `analyze_full_text(text: str, chunk_size: int = 3000, chunk_overlap: int = 200) -> ActAnalysis`

**Testy:**

```
TestTextAnalyzerSummarize:
  test_summarize_fragment_returns_summary_text
    - Mock openai_client.analyze_with_prompt → {"content": "Podsumowanie..."}
    - Oczekiwanie: string z podsumowaniem

  test_summarize_fragment_empty_text_returns_default
    - Input: ""
    - Oczekiwanie: domyślna odpowiedź lub pusty string (sprawdź w kodzie)

  test_summarize_fragment_api_error_raises_ai_service_error
    - Mock rzuca AIServiceError
    - Oczekiwanie: propagacja wyjątku

TestTextAnalyzerAnalyze:
  test_analyze_full_text_short_text_no_chunking
    - Input: krótki tekst (< chunk_size)
    - Oczekiwanie: ActAnalysis z poprawnymi polami

  test_analyze_full_text_long_text_uses_chunking
    - Input: tekst dłuższy niż chunk_size
    - Oczekiwanie: openai_client wywoływany wielokrotnie (raz per chunk + finalne)

  test_analyze_full_text_returns_act_analysis_dataclass
    - Oczekiwanie: isinstance(result, ActAnalysis)

  test_analyze_full_text_malformed_response_raises_ai_service_error
    - Mock zwraca nieoczekiwany format
    - Oczekiwanie: AIServiceError
```

**Ważne:** Przeczytaj kod aby zrozumieć:
1. Jak `analyze_full_text` dzieli tekst (RecursiveCharacterTextSplitter z langchain)
2. Jaki prompt wysyła do OpenAI
3. Jak parsuje odpowiedź do `ActAnalysis`
4. Czy `summarize_fragment` to osobna metoda czy część `analyze_full_text`

### 2.4 Categorizer
**Plik:** `backend/tests/unit/test_services/test_ai/test_categorizer.py`
**Moduł:** `app.services.ai.categorizer.Categorizer`

**Konstruktor:** `Categorizer(openai_client=None, category_repo=None)`

**Metoda główna:** `find_or_create_category(act_keywords, act_title="", act_content="") -> Optional[str]`

**Logika:** Wysyła do OpenAI listę istniejących kategorii + keywords aktu, AI odpowiada
jedną z akcji: MATCH (użyj istniejącej), EXTEND (dodaj keywords do istniejącej),
CREATE (stwórz nową kategorię).

**Testy:**

```
TestCategorizerFindOrCreate:
  test_find_or_create_match_existing_category
    - Mock category_repo.get_all_categories → [Category("Prawo karne", [...])]
    - Mock openai_client.analyze_with_prompt → {"action": "MATCH", "category": "Prawo karne"}
    - Oczekiwanie: "Prawo karne"

  test_find_or_create_extend_existing_category
    - Mock AI → {"action": "EXTEND", "category": "Prawo karne", "keywords": ["nowe"]}
    - Mock category_repo.extend_keywords → "Prawo karne"
    - Oczekiwanie: "Prawo karne", extend_keywords wywołane

  test_find_or_create_create_new_category
    - Mock AI → {"action": "CREATE", "category": "Nowa kategoria", "keywords": ["a", "b"]}
    - Mock category_repo.create_category → "Nowa kategoria"
    - Oczekiwanie: "Nowa kategoria", create_category wywołane

  test_find_or_create_empty_keywords_returns_none
    - Input: act_keywords=[]
    - Oczekiwanie: None (sprawdź w kodzie czy jest taki guard)

  test_find_or_create_ai_error_returns_none
    - Mock AI rzuca wyjątek
    - Oczekiwanie: None (metoda łapie Exception i zwraca None)

  test_find_or_create_invalid_ai_response_returns_none
    - Mock AI → {"unexpected": "format"}
    - Oczekiwanie: None
```

**Ważne:** Przeczytaj `_handle_match`, `_handle_extend`, `_handle_create` żeby
zrozumieć dokładną strukturę odpowiedzi AI i jak są przetwarzane.

---

## Phase 3: Pipeline i Orchestracja

### 3.1 ActFetcher
**Plik:** `backend/tests/unit/test_pipeline/test_act_fetcher.py`
**Moduł:** `app.pipeline.act_fetcher.ActFetcher`

**Konstruktor:** `ActFetcher(sejm_api=None, file_handler=None)`

**Metody:**
- `fetch_and_filter_acts() -> List[Dict]`
- `identify_new_acts(items: List[Dict]) -> List[Dict]`
- `get_elis_to_check_later() -> List[str]`
- `remove_eli_from_later(eli: str) -> None`
- `_check_voting_available(eli: str) -> bool`
- `_save_eli_for_later(eli: str) -> None`

**Testy:**

```
TestActFetcherFetchAndFilter:
  test_fetch_and_filter_returns_valid_acts
    - Mock sejm_api.fetch_acts_for_year → lista actów z type "Ustawa"
    - Oczekiwanie: tylko "Ustawa" type w wyniku

  test_fetch_and_filter_empty_api_response_returns_empty
    - Mock → []
    - Oczekiwanie: []

  test_fetch_and_filter_filters_invalid_eli_formats
    - Mock → akty z niepoprawnym ELI
    - Oczekiwanie: odfiltrowane (lub bug — sprawdź zachowanie)

  test_fetch_and_filter_limits_to_max_acts
    - Mock → 50 aktów
    - Oczekiwanie: max 10 (sprawdź limit w kodzie)

TestActFetcherIdentifyNew:
  test_identify_new_acts_no_known_returns_all
    - Mock file_handler.read_json (last_known) → None
    - Oczekiwanie: wszystkie akty

  test_identify_new_acts_with_known_returns_only_new
    - Mock last_known z ELI starszego aktu
    - Input: lista z aktami przed i po
    - Oczekiwanie: tylko akty nowsze od last_known

  test_identify_new_acts_empty_input_returns_empty
    - Input: []
    - Oczekiwanie: []

TestActFetcherElisForLater:
  test_get_elis_to_check_later_reads_from_file
    - Mock file_handler.read_json → ["ELI1", "ELI2"]
    - Oczekiwanie: ["ELI1", "ELI2"]

  test_get_elis_to_check_later_empty_file_returns_empty
    - Mock → [] lub None
    - Oczekiwanie: []

  test_remove_eli_from_later_updates_file
    - Mock current list = ["A", "B", "C"]
    - remove_eli_from_later("B")
    - Oczekiwanie: file_handler.write_json z ["A", "C"]

  test_save_eli_for_later_appends_to_file
    - Mock current list = ["A"]
    - _save_eli_for_later("B")
    - Oczekiwanie: file_handler.write_json z ["A", "B"]

TestActFetcherCheckVoting:
  test_check_voting_available_true
    - Mock sejm_api.fetch_voting_process → dane z votings
    - Oczekiwanie: True

  test_check_voting_available_false_no_votings
    - Mock → dane bez votings
    - Oczekiwanie: False

  test_check_voting_available_api_error_returns_false
    - Mock rzuca wyjątek
    - Oczekiwanie: False
```

### 3.2 PipelineOrchestrator
**Plik:** `backend/tests/unit/test_pipeline/test_orchestrator.py`
**Moduł:** `app.pipeline.orchestrator.PipelineOrchestrator`

**Konstruktor:** `PipelineOrchestrator(fetcher=None, processor=None, sejm_api=None, file_handler=None)`

**Metody:**
- `check_for_new_acts() -> None`
- `check_old_elis() -> None`

**Testy:**

```
TestOrchestratorCheckForNewActs:
  test_check_for_new_acts_processes_fetched_acts
    - Mock fetcher.fetch_and_filter_acts → [act1, act2]
    - Mock fetcher.identify_new_acts → [act1]
    - Mock processor.process_and_save → True
    - Oczekiwanie: process_and_save wywołane raz

  test_check_for_new_acts_no_new_acts_does_nothing
    - Mock identify_new_acts → []
    - Oczekiwanie: process_and_save NIE wywołane

  test_check_for_new_acts_saves_last_known_after_processing
    - Mock → 1 akt przetworzony
    - Oczekiwanie: file_handler.write_json wywołane (sprawdź _save_last_known)

  test_check_for_new_acts_processing_failure_continues
    - Mock process_and_save → False (error)
    - Oczekiwanie: nie rzuca wyjątku, kontynuuje z następnym

  test_check_for_new_acts_fetch_error_handled
    - Mock fetch_and_filter_acts rzuca Exception
    - Oczekiwanie: obsłużony błąd, nie crash

TestOrchestratorCheckOldElis:
  test_check_old_elis_reprocesses_elis_with_voting
    - Mock fetcher.get_elis_to_check_later → ["ELI1", "ELI2"]
    - Mock sejm_api.fetch_act_details → dane aktu
    - Mock _check_voting → True (pośrednio)
    - Mock processor.process_and_save → True
    - Oczekiwanie: process_and_save wywołane, eli usunięte z later

  test_check_old_elis_no_voting_keeps_in_later
    - Mock _check_voting → False
    - Oczekiwanie: eli NIE usunięte z later

  test_check_old_elis_empty_list_does_nothing
    - Mock get_elis_to_check_later → []
    - Oczekiwanie: brak wywołań process_and_save

  test_check_old_elis_skips_empty_eli_strings
    - Mock → ["ELI1", "", "ELI3"]
    - Oczekiwanie: "" pominięte (sprawdź w kodzie)
```

### 3.3 ActProcessor.process_and_save (integracja z mockami)
**Plik:** ten sam co Phase 1 → `test_act_processor.py`

**Dodaj nową klasę:**

```
TestActProcessorProcessAndSave:
  # Fixture: instancja z 6 zamockowanymi zależnościami

  test_process_and_save_full_success_returns_true
    - Mock sejm_api.fetch_act_details → ActData
    - Mock sejm_api.get_pdf_url → "http://url.pdf"
    - Mock pdf_processor.download_and_extract → "tekst aktu"
    - Mock text_analyzer.analyze_full_text → ActAnalysis(...)
    - Mock categorizer.find_or_create_category → "Prawo karne"
    - Mock votes: _get_voting_details → {...}
    - Mock act_repo.save_act → True
    - Oczekiwanie: True

  test_process_and_save_pdf_error_returns_false
    - Mock pdf_processor.download_and_extract rzuca PDFProcessingError
    - Oczekiwanie: False

  test_process_and_save_ai_error_returns_false
    - Mock text_analyzer rzuca AIServiceError
    - Oczekiwanie: False

  test_process_and_save_db_error_returns_false
    - Mock act_repo.save_act rzuca DatabaseError
    - Oczekiwanie: False

  test_process_and_save_no_voting_still_saves
    - Mock _get_voting_details → None
    - Oczekiwanie: True, act saved z voting=None

  test_process_and_save_no_category_still_saves
    - Mock categorizer → None
    - Oczekiwanie: True, act saved z category=None
```

---

## Phase 4: Repository Layer

### 4.1 BaseRepository
**Plik:** `backend/tests/unit/test_repositories/test_base_repository.py`
**Moduł:** `app.repositories.base_repository.BaseRepository`

**Testy:**

```
TestBaseRepository:
  test_init_with_connection_string
    - Nie rzuca wyjątku

  test_init_without_connection_string_raises_database_error
    - patch env żeby DATABASE_URL nie istniał
    - pytest.raises(DatabaseError)

  test_get_connection_returns_cursor_and_connection
    - patch('app.repositories.base_repository.psycopg2.connect')
    - Mock connection z cursor()
    - Użyj `with repo.get_connection() as (conn, cur):`
    - Oczekiwanie: conn i cur nie None

  test_get_connection_commits_on_success
    - Po wyjściu z context managera
    - Oczekiwanie: conn.commit() wywołane

  test_get_connection_rollbacks_on_error
    - Rzuć wyjątek wewnątrz `with` bloku
    - Oczekiwanie: conn.rollback() wywołane

  test_get_connection_closes_on_exit
    - Oczekiwanie: conn.close() wywołane
```

### 4.2 ActRepository
**Plik:** `backend/tests/unit/test_repositories/test_act_repository.py`
**Moduł:** `app.repositories.act_repository.ActRepository`

**Testy:**

```
TestActRepositorySaveAct:
  # Fixture: mock get_connection jako context manager

  test_save_act_executes_insert_query
    - Mock cursor.execute
    - Input: Act z pełnymi danymi
    - Oczekiwanie: cursor.execute wywołane z INSERT

  test_save_act_returns_true_on_success
    - Oczekiwanie: True

  test_save_act_duplicate_key_raises_database_error
    - Mock cursor.execute rzuca psycopg2.IntegrityError
    - Oczekiwanie: DatabaseError

  test_save_act_connection_error_raises_database_error
    - Mock get_connection rzuca psycopg2.OperationalError
    - Oczekiwanie: DatabaseError

TestActRepositoryGetAct:
  test_get_act_by_number_found_returns_act
    - Mock cursor.fetchone → tuple z danymi
    - Oczekiwanie: Act instance

  test_get_act_by_number_not_found_returns_none
    - Mock cursor.fetchone → None
    - Oczekiwanie: None
```

**Ważne:** `get_connection` jest context manager. Mockuj go tak:
```python
mock_conn = MagicMock()
mock_cursor = MagicMock()
mock_conn.cursor.return_value = mock_cursor

with patch.object(repo, 'get_connection') as mock_gc:
    mock_gc.return_value.__enter__ = Mock(return_value=(mock_conn, mock_cursor))
    mock_gc.return_value.__exit__ = Mock(return_value=False)
```

### 4.3 CategoryRepository
**Plik:** `backend/tests/unit/test_repositories/test_category_repository.py`
**Moduł:** `app.repositories.category_repository.CategoryRepository`

**Testy:**

```
TestCategoryRepositoryFindByKeywords:
  test_find_by_keywords_match_returns_category_name
    - Mock cursor.fetchone → ("Prawo karne",)
    - Oczekiwanie: "Prawo karne"

  test_find_by_keywords_no_match_returns_none
    - Mock cursor.fetchone → None (dla wszystkich fallback queries)
    - Oczekiwanie: None

  test_find_by_keywords_empty_keywords_returns_none
    - Input: []
    - Oczekiwanie: None

TestCategoryRepositoryGetAll:
  test_get_all_categories_returns_list
    - Mock cursor.fetchall → [("Prawo karne", '["karny", "kara"]'), ...]
    - Oczekiwanie: [Category(...), ...]

  test_get_all_categories_empty_table_returns_empty
    - Mock cursor.fetchall → []
    - Oczekiwanie: []

TestCategoryRepositoryCreate:
  test_create_category_returns_name
    - Oczekiwanie: nazwa kategorii

  test_create_category_db_error_raises
    - Mock rzuca IntegrityError
    - Oczekiwanie: DatabaseError

TestCategoryRepositoryExtend:
  test_extend_keywords_adds_new_keywords
    - Oczekiwanie: cursor.execute z UPDATE query
```

---

## Phase 5: Naprawa i walidacja

### 5.1 Validator Bug Fix Test
**Plik:** `backend/tests/unit/test_utils/test_validators.py` (ISTNIEJĄCY — dodaj testy)

**Dodaj testy do istniejącej klasy `TestValidateEliFormat`:**

```
  test_validate_eli_new_du_format_accepted
    - Input: "DU/2026/137"
    - Oczekiwanie: True (po naprawie buga)

  test_validate_eli_new_du_format_with_different_years
    - Input: "DU/2025/100", "DU/2024/1", "MP/2026/50"
    - Oczekiwanie: True dla każdego

  test_validate_eli_old_format_still_accepted
    - Input: "/pl/act/dz/2024/123"
    - Oczekiwanie: True (regresja)

  test_validate_eli_invalid_formats_rejected
    - Input: "", "random", "123/456", "DU//2026", None
    - Oczekiwanie: False
```

**UWAGA:** Te testy będą FAILOWAĆ dopóki nie naprawisz buga w
`backend/app/utils/validators.py:25`. Regex powinien akceptować oba formaty:
```python
pattern = r"^(?:/[a-z]{2}/[a-z]+/[a-z]+/\d{4}/\d+|[A-Z]+/\d{4}/\d+).*$"
```

---

## Podsumowanie kolejności

| Phase | Pliki | Szacowana liczba testów | Priorytet |
|-------|-------|------------------------|-----------|
| 1 | test_votes_calculator.py, test_act_processor.py (private) | ~20 | KRYTYCZNY |
| 2 | test_openai_client.py, test_pdf_processor.py, test_text_analyzer.py, test_categorizer.py | ~30 | WYSOKI |
| 3 | test_act_fetcher.py, test_orchestrator.py, test_act_processor.py (process_and_save) | ~25 | WYSOKI |
| 4 | test_base_repository.py, test_act_repository.py, test_category_repository.py | ~20 | ŚREDNI |
| 5 | test_validators.py (rozszerzenie) | ~5 | KRYTYCZNY (bug fix) |
| **TOTAL** | **12 plików** | **~100** | |

## Checklist po zakończeniu

- [ ] Wszystkie testy przechodzą: `cd backend && python -m pytest tests/unit/ -v`
- [ ] Coverage: `cd backend && python -m pytest tests/unit/ --cov=app --cov-report=term-missing`
- [ ] Żaden test nie wymaga połączenia z bazą danych, API Sejmu ani OpenAI
- [ ] Żaden test nie tworzy plików poza tmp_path
- [ ] Bug w validatorze zgłoszony / naprawiony

---

## Struktura plików do stworzenia

```
backend/tests/unit/
├── test_services/
│   ├── test_votes_calculator.py          ← Phase 1
│   ├── test_act_processor.py             ← Phase 1 + 3
│   ├── test_external/
│   │   ├── test_openai_client.py         ← Phase 2
│   │   └── test_pdf_processor.py         ← Phase 2
│   └── test_ai/
│       ├── __init__.py                   ← Phase 2
│       ├── test_text_analyzer.py         ← Phase 2
│       └── test_categorizer.py           ← Phase 2
├── test_pipeline/
│   ├── __init__.py                       ← Phase 3
│   ├── test_act_fetcher.py              ← Phase 3
│   └── test_orchestrator.py             ← Phase 3
├── test_repositories/
│   ├── __init__.py                       ← Phase 4
│   ├── test_base_repository.py          ← Phase 4
│   ├── test_act_repository.py           ← Phase 4
│   └── test_category_repository.py      ← Phase 4
└── test_utils/
    └── test_validators.py               ← Phase 5 (rozszerzenie)
```
