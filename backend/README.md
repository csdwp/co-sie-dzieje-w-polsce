# CO-SIE-DZIEJE-W-POLSCE - Backend

Backend application for processing and analyzing Polish legal acts from the
official Monitor Polski.

## 🎯 Overview

This application:

1. Fetches legal acts (Ustawa, Rozporządzenie) from official Polish APIs
2. Downloads and extracts text from PDF documents
3. Analyzes content using AI (OpenAI GPT)
4. Fetches parliamentary voting data
5. Categorizes acts automatically
6. Stores structured data in PostgreSQL

## 🏗️ Architecture (Refactored)

The backend follows a **layered architecture** with clear separation of
concerns:

```
app/
├── core/           # Core utilities (config, logging, exceptions)
├── models/         # Data models (dataclasses)
├── repositories/   # Database access layer
├── services/       # Business logic
│   ├── external/  # External API clients
│   ├── ai/        # AI-powered services
│   ├── act_processor.py
│   └── votes_calculator.py
├── pipeline/       # Pipeline orchestration
├── utils/          # Shared utilities
└── data/           # JSON data files
```

### Key Components

- **Pipeline**: Orchestrates the entire processing workflow
- **Services**: Business logic for processing acts
- **Repositories**: Database operations
- **Models**: Type-safe data structures
- **Utils**: Shared utilities (file handling, validation, retry)

## 📦 Installation

### Prerequisites

- Python 3.13+
- PostgreSQL database
- OpenAI API key

### Setup

1. **Clone and navigate:**

```bash
cd backend
```

2. **Create virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r app/requirements.txt
```

4. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:

```bash
DATABASE_URL=postgresql://user:pass@localhost/dbname
BASIC_URL=https://api.sejm.gov.pl/eli/acts
DU_URL=https://api.sejm.gov.pl/eli/acts/DU
OPENAI_API_KEY=sk-...
VOTING_URL=https://api.sejm.gov.pl/sejm  # optional
```

## 🚀 Usage

### Running the Pipeline

**Using the refactored code (recommended):**

```bash
cd app
python -m pipeline.run_pipeline_new
```

**Using the old code (deprecated):**

```bash
cd app
python -m pipeline.run_pipeline
```

### Programmatic Usage

```python
from app.pipeline import check_for_new_acts, check_old_elis

# Process new acts
check_for_new_acts()

# Check acts waiting for voting data
check_old_elis()
```

For more examples, see [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md).

## 📚 Documentation

- **[REFACTOR_GUIDE.md](REFACTOR_GUIDE.md)** - Architecture overview and
  migration guide
- **[MIGRATION_MAP.md](MIGRATION_MAP.md)** - Detailed mapping of old → new code
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Comprehensive code examples
- **[REFACTOR_SUMMARY.md](REFACTOR_SUMMARY.md)** - Refactoring summary and
  metrics

## 🔄 Refactoring Status

✅ **Core Layer** - Logging, exceptions, config  
✅ **Models Layer** - Type-safe dataclasses  
✅ **Repositories** - Database access layer  
✅ **Services** - Business logic separated  
✅ **Pipeline** - Orchestration refactored  
✅ **Utils** - Shared utilities  
✅ **Documentation** - Comprehensive guides  
⏳ **Testing** - New code ready for testing  
⏳ **Migration** - Pending verification

## 🧪 Testing

The refactored code is structured for easy testing:

```python
# Example: Test with mocked dependencies
from unittest.mock import Mock
from app.services import ActProcessor

mock_sejm_api = Mock()
mock_pdf_processor = Mock()

processor = ActProcessor(
    sejm_api=mock_sejm_api,
    pdf_processor=mock_pdf_processor
)

# Test your logic
```

## 📊 Database Schema

```sql
-- acts table
CREATE TABLE acts (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    act_number VARCHAR,
    simple_title VARCHAR,
    content TEXT,
    refs JSON,
    texts JSON,
    item_type VARCHAR,
    announcement_date DATE,
    change_date DATE,
    promulgation DATE,
    item_status VARCHAR,
    comments TEXT,
    keywords VARCHAR[],
    file VARCHAR,
    votes JSON,
    category VARCHAR
);

-- category table
CREATE TABLE category (
    category VARCHAR PRIMARY KEY,
    keywords VARCHAR[] DEFAULT '{}'
);
```

## 🔧 Development

### Code Style

- Follow PEP 8
- Use type hints
- Document with docstrings
- Keep functions focused (single responsibility)

### Adding New Features

1. **New Service**: Add to `app/services/`
2. **New Repository**: Add to `app/repositories/`
3. **New Model**: Add to `app/models/`
4. **New Utility**: Add to `app/utils/`

Example:

```python
# app/services/my_new_service.py
from ..core.logging import get_logger

logger = get_logger(__name__)

class MyNewService:
    def __init__(self):
        pass

    def do_something(self):
        logger.info("Doing something...")
```

## 🐛 Troubleshooting

### Import Errors

```bash
# Make sure you're in the correct directory
cd backend/app
python -m pipeline.run_pipeline_new
```

### Database Connection

```bash
# Test database connection
python -c "from app.repositories import ActRepository; repo = ActRepository()"
```

### OpenAI API Errors

- Check API key is valid
- Verify rate limits
- Check network connectivity

### Logs

Check application logs:

```bash
tail -f app/logs/app.log
```

## 📈 Performance

- **Acts per run**: Configurable (default: 10)
- **PDF timeout**: 30 seconds
- **Retry logic**: Automatic with exponential backoff
- **Concurrent processing**: Sequential (can be parallelized)

## 🔐 Security

- Environment variables for sensitive data
- No credentials in code
- Database connection pooling
- API rate limiting respected

## 🛠️ Tech Stack

- **Python 3.13**
- **PostgreSQL** - Database
- **OpenAI GPT-3.5** - Text analysis
- **LangChain** - Text processing
- **PyMuPDF** - PDF extraction
- **requests** - HTTP client
- **tenacity** - Retry logic
- **pg8000** - PostgreSQL driver

## 📝 License

[Your License Here]

## 👥 Contributors

[Your Team Here]

## 🔗 Related

- Frontend: `../frontend/`
- API Documentation: [Link to API docs if available]

## 📞 Support

For questions or issues:

1. Check documentation in this folder
2. Review inline code documentation (docstrings)
3. Check logs: `app/logs/app.log`
4. [Contact information]

---

**Note**: This backend has been recently refactored. See
[REFACTOR_GUIDE.md](REFACTOR_GUIDE.md) for details on the new architecture.
