# Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTRY POINT                              │
│                  pipeline/run_pipeline_new.py                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE ORCHESTRATOR                         │
│                   pipeline/orchestrator.py                       │
│  • check_for_new_acts()                                         │
│  • check_old_elis()                                             │
└──────────┬──────────────────────────┬───────────────────────────┘
           │                          │
           ▼                          ▼
   ┌───────────────┐         ┌─────────────────┐
   │  ActFetcher   │         │  ActProcessor   │
   │               │         │                 │
   │ • fetch       │         │ • process       │
   │ • filter      │         │ • analyze       │
   │ • identify    │         │ • save          │
   └───────┬───────┘         └────────┬────────┘
           │                          │
           │                          ▼
           │              ┌──────────────────────────┐
           │              │    SERVICE LAYER         │
           │              ├──────────────────────────┤
           │              │ • TextAnalyzer           │
           │              │ • Categorizer            │
           │              │ • VotesCalculator        │
           │              │ • SejmAPIClient          │
           │              │ • PDFProcessor           │
           │              │ • OpenAIClient           │
           │              └───────────┬──────────────┘
           │                          │
           │                          ▼
           │              ┌──────────────────────────┐
           │              │   REPOSITORY LAYER       │
           │              ├──────────────────────────┤
           │              │ • ActRepository          │
           │              │ • CategoryRepository     │
           │              └───────────┬──────────────┘
           │                          │
           │                          ▼
           │              ┌──────────────────────────┐
           │              │      DATABASE            │
           │              │     PostgreSQL           │
           │              └──────────────────────────┘
           │
           ▼
   ┌───────────────────┐
   │   UTILS LAYER     │
   ├───────────────────┤
   │ • FileHandler     │
   │ • Validators      │
   │ • RetryHandler    │
   └───────────────────┘

           All layers use:
   ┌───────────────────────────┐
   │      CORE LAYER           │
   ├───────────────────────────┤
   │ • Logging (get_logger)    │
   │ • Exceptions              │
   │ • Configuration           │
   └───────────────────────────┘
```

## Dependency Graph

```
                   ┌──────────────┐
                   │   Pipeline   │
                   │ Orchestrator │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   Act    │   │   Act    │   │  File    │
    │ Fetcher  │   │Processor │   │ Handler  │
    └────┬─────┘   └────┬─────┘   └──────────┘
         │              │
         │              ├─────────────────────────┐
         │              │                         │
         ▼              ▼                         ▼
    ┌──────────┐   ┌──────────┐          ┌──────────────┐
    │  Sejm    │   │   Text   │          │ Categorizer  │
    │   API    │   │ Analyzer │          └──────┬───────┘
    └──────────┘   └────┬─────┘                 │
                        │                        │
                        ▼                        ▼
                   ┌──────────┐          ┌──────────────┐
                   │  OpenAI  │          │  Category    │
                   │  Client  │          │ Repository   │
                   └──────────┘          └──────────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
    ┌──────────┐      ┌──────────┐
    │   PDF    │      │  Votes   │
    │Processor │      │Calculator│
    └──────────┘      └──────────┘
         │
         ▼
    ┌──────────┐
    │   Act    │
    │Repository│
    └──────────┘
         │
         ▼
    ┌──────────┐
    │PostgreSQL│
    └──────────┘
```

## Layer Responsibilities

### 1. Core Layer

**Location**: `app/core/`

**Purpose**: Foundational utilities used across all layers

**Components**:

- `config.py` - Environment configuration
- `logging.py` - Centralized logging setup
- `exceptions.py` - Custom exception hierarchy

**Dependencies**: None (base layer)

---

### 2. Models Layer

**Location**: `app/models/`

**Purpose**: Type-safe data structures

**Components**:

- `act.py` - Act, ActAnalysis, ActData
- `category.py` - Category
- `voting.py` - VotingData + related classes

**Dependencies**: Core layer only

---

### 3. Utils Layer

**Location**: `app/utils/`

**Purpose**: Shared utilities

**Components**:

- `file_handler.py` - File I/O operations
- `validators.py` - Data validation
- `retry_handler.py` - Retry decorators

**Dependencies**: Core, Models

---

### 4. Repository Layer

**Location**: `app/repositories/`

**Purpose**: Database access (CRUD operations)

**Components**:

- `base_repository.py` - DB connection management
- `act_repository.py` - Acts table operations
- `category_repository.py` - Categories table operations

**Dependencies**: Core, Models, Utils

**Pattern**: Repository Pattern

- Abstracts database operations
- Returns domain models (dataclasses)
- Handles connection management

---

### 5. Services Layer

**Location**: `app/services/`

**Purpose**: Business logic and external integrations

#### 5.1 External Services

**Location**: `app/services/external/`

**Components**:

- `sejm_api.py` - Sejm API client
- `openai_client.py` - OpenAI client
- `pdf_processor.py` - PDF processing

**Purpose**: Interact with external systems

#### 5.2 AI Services

**Location**: `app/services/ai/`

**Components**:

- `text_analyzer.py` - AI-powered text analysis
- `categorizer.py` - AI-powered categorization

**Purpose**: AI/ML functionality

#### 5.3 Core Services

**Location**: `app/services/`

**Components**:

- `act_processor.py` - Main orchestrator
- `votes_calculator.py` - Voting statistics

**Purpose**: Core business logic

**Dependencies**: All lower layers

---

### 6. Pipeline Layer

**Location**: `app/pipeline/`

**Purpose**: Orchestrate the complete workflow

**Components**:

- `orchestrator.py` - Main coordinator
- `act_fetcher.py` - Fetch and filter acts
- `run_pipeline_new.py` - Entry point

**Dependencies**: All lower layers

**Pattern**: Facade/Orchestrator Pattern

- Provides simple interface to complex subsystems
- Coordinates multiple services
- Handles high-level flow

---

## Data Flow

### Processing a Single Act

```
1. FETCH
   ActFetcher.fetch_and_filter_acts()
   └─> SejmAPIClient.fetch_acts_for_year()
       └─> Returns: List[Dict[str, Any]]

2. IDENTIFY
   ActFetcher.identify_new_acts()
   └─> FileHandler.read_json(last_known)
       └─> Returns: List[Dict[str, Any]] (new acts)

3. PROCESS
   ActProcessor.process_and_save(act_data)
   │
   ├─> PDFProcessor.download_and_extract(url)
   │   └─> Returns: str (PDF text)
   │
   ├─> TextAnalyzer.analyze_full_text(text)
   │   └─> OpenAIClient.analyze_with_prompt()
   │       └─> Returns: ActAnalysis
   │
   ├─> SejmAPIClient.fetch_act_details(eli)
   │   └─> Returns: Dict[str, Any]
   │
   ├─> VotesCalculator.process_voting_data()
   │   └─> Returns: Dict[str, Any]
   │
   ├─> Categorizer.find_or_create_category()
   │   ├─> CategoryRepository.get_all_categories()
   │   ├─> OpenAIClient.analyze_with_prompt()
   │   └─> CategoryRepository.create_category()
   │       └─> Returns: str (category name)
   │
   └─> ActRepository.save_act(act)
       └─> PostgreSQL INSERT
           └─> Returns: bool (success)

4. FINALIZE
   FileHandler.write_json(last_known, act_data)
   └─> Updates last processed act
```

### Error Handling Flow

```
┌──────────────────┐
│   Try Block      │
│   (Process Act)  │
└────────┬─────────┘
         │
         ├─ PDFProcessingError
         │  └─> Log error, skip act, continue
         │
         ├─ AIServiceError
         │  └─> Retry (automatic), log error, skip act
         │
         ├─ ExternalAPIError
         │  └─> Retry (automatic), log error, skip act
         │
         ├─ DatabaseError
         │  └─> Log error, skip act, continue
         │
         └─ Exception (catch-all)
            └─> Log error, skip act, continue
```

## Design Patterns Used

### 1. Repository Pattern

**Where**: `repositories/`

**Why**: Separates data access from business logic

**Example**:

```python
class ActRepository:
    def save_act(self, act: Act) -> bool:
        # Abstract away SQL details
```

### 2. Dependency Injection

**Where**: Throughout services

**Why**: Easier testing, loose coupling

**Example**:

```python
class ActProcessor:
    def __init__(self, sejm_api=None, pdf_processor=None):
        self.sejm_api = sejm_api or SejmAPIClient()
        # Can inject mocks for testing
```

### 3. Facade Pattern

**Where**: `pipeline/orchestrator.py`

**Why**: Simple interface to complex subsystems

**Example**:

```python
def check_for_new_acts():
    # Hides complexity of multiple services
    orchestrator = PipelineOrchestrator()
    orchestrator.check_for_new_acts()
```

### 4. Strategy Pattern

**Where**: Retry handlers

**Why**: Different retry strategies for different APIs

**Example**:

```python
@retry_external_api  # 3 retries, short wait
def fetch_from_sejm(): pass

@retry_ai_service    # 5 retries, longer wait
def call_openai(): pass
```

### 5. Factory Pattern

**Where**: `core/logging.py`

**Why**: Centralized logger creation

**Example**:

```python
def get_logger(name: str) -> logging.Logger:
    # Creates configured logger
```

## Configuration Management

### Environment Variables

```
DATABASE_URL       → Repository layer
BASIC_URL         → SejmAPIClient
DU_URL            → SejmAPIClient
OPENAI_API_KEY    → OpenAIClient
VOTING_URL        → SejmAPIClient (optional)
```

### File-based Configuration

```
config.py          → Constants, file paths
data/              → Runtime data (last_known.json, etc.)
logs/              → Application logs
```

## Scalability Considerations

### Current Limitations

1. **Sequential Processing** - One act at a time
2. **No Caching** - Every request hits API/DB
3. **No Queue System** - Synchronous execution
4. **Single Instance** - No distributed processing

### Future Improvements

1. **Parallel Processing**

   ```python
   from concurrent.futures import ThreadPoolExecutor

   with ThreadPoolExecutor(max_workers=5) as executor:
       executor.map(processor.process_and_save, acts)
   ```

2. **Caching Layer**

   ```python
   # Add Redis caching
   from redis import Redis
   cache = Redis()

   @cache_result(ttl=3600)
   def fetch_act_details(eli):
       # ...
   ```

3. **Task Queue**

   ```python
   # Add Celery for background processing
   from celery import Celery

   @app.task
   def process_act_async(act_data):
       # ...
   ```

4. **API Layer**

   ```python
   # Add FastAPI for REST endpoints
   from fastapi import FastAPI

   @app.post("/api/acts/process")
   async def process_act(eli: str):
       # ...
   ```

## Testing Strategy

### Unit Tests

- Test individual services with mocked dependencies
- Test utilities in isolation
- Test models (data validation)

### Integration Tests

- Test repository layer with test database
- Test external API clients (with VCR.py)
- Test service interactions

### End-to-End Tests

- Test complete pipeline with test data
- Verify database state after processing
- Check file system operations

## Monitoring & Observability

### Current

- **Logging**: Structured logs in `logs/app.log`
- **Error Tracking**: Exception hierarchy with context

### Future

- **Metrics**: Prometheus metrics
- **Tracing**: OpenTelemetry traces
- **Alerts**: Error rate, processing time alerts
- **Dashboard**: Grafana visualization

## Security Considerations

### Current

✅ Environment variables for secrets  
✅ No credentials in code  
✅ Input validation  
✅ SQL parameterization (pg8000)

### Future

- [ ] API authentication/authorization
- [ ] Rate limiting
- [ ] Input sanitization (XSS, injection)
- [ ] Audit logging
- [ ] Secrets management (Vault)

---

This architecture provides a solid foundation for growth while maintaining code
quality and developer experience.
