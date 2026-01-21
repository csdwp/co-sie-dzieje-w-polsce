# Development Guide

## Narzędzia do formatowania i lintingu kodu

### Python (Backend)

#### Setup

```bash
# Stwórz wirtualne środowisko (jeśli jeszcze nie istnieje)
python3 -m venv .venv

# Aktywuj wirtualne środowisko
source .venv/bin/activate

# Zainstaluj narzędzia deweloperskie
make install-dev
```

#### Dostępne komendy Make

```bash
# Formatuj kod (black + isort)
make format

# Sprawdź linting (flake8)
make lint

# Sprawdź typy (mypy)
make type-check

# Uruchom wszystkie checki naraz
make check
```

#### Narzędzia

- **Black** - Automatyczne formatowanie kodu (jak Prettier dla Pythona)
- **isort** - Automatyczne sortowanie importów
- **flake8** - Linting (sprawdzanie stylu kodu, jak ESLint)
- **mypy** - Sprawdzanie typów (jak TypeScript)
- **pylint** - Dodatkowy linter (bardziej restrykcyjny)

#### Pre-commit hooks

Po zainstalowaniu pre-commit hooks (`pre-commit install`), kod będzie
automatycznie formatowany przed każdym commitem:

```bash
# Zainstaluj hooki (tylko raz)
.venv/bin/pre-commit install

# Ręcznie uruchom hooki na wszystkich plikach
.venv/bin/pre-commit run --all-files
```

#### Konfiguracja

- `pyproject.toml` - Konfiguracja dla black, isort, mypy
- `.flake8` - Konfiguracja dla flake8
- `.pylintrc` - Konfiguracja dla pylint
- `.pre-commit-config.yaml` - Konfiguracja pre-commit hooks

### JavaScript/TypeScript (Frontend)

#### Setup

```bash
cd frontend

# Zainstaluj zależności
pnpm install
# lub
npm install
```

#### Dostępne komendy

```bash
# Sprawdź linting
pnpm lint
# lub
npm run lint

# Napraw problemy z lintingiem automatycznie
pnpm lint:fix
# lub
npm run lint:fix

# Formatuj kod przy użyciu Prettier
pnpm format
# lub
npm run format

# Sprawdź czy kod jest poprawnie sformatowany
pnpm format:check
# lub
npm run format:check
```

#### Narzędzia

- **ESLint** - Linting dla JavaScript/TypeScript
- **Prettier** - Automatyczne formatowanie kodu

#### Konfiguracja

- `eslint.config.mjs` - Konfiguracja ESLint
- `.prettierrc` - Konfiguracja Prettier
- `.prettierignore` - Pliki ignorowane przez Prettier

## Best Practices

1. **Przed commitem** - Zawsze uruchom `make check` (backend) lub
   `pnpm lint && pnpm format` (frontend)
2. **Pre-commit hooks** - Zainstaluj je, aby automatycznie formatować kod
3. **CI/CD** - Rozważ dodanie tych checków do CI/CD pipeline
4. **VS Code** - Zainstaluj rozszerzenia:
   - Python (Microsoft)
   - Black Formatter
   - Pylance
   - ESLint
   - Prettier

## Rozwiązywanie problemów

### Python

**Problem**: `make: flake8: No such file or directory` **Rozwiązanie**:
Zainstaluj narzędzia deweloperskie:

```bash
make install-dev
```

**Problem**: Nie można aktywować venv **Rozwiązanie**:

```bash
# Na macOS/Linux
source .venv/bin/activate

# Na Windows
.venv\Scripts\activate
```

### Frontend

**Problem**: `command not found: pnpm` **Rozwiązanie**: Użyj npm zamiast pnpm
lub zainstaluj pnpm:

```bash
npm install -g pnpm
```

## Struktura projektu

```
.
├── backend/               # Aplikacja Python
│   └── app/              # Kod źródłowy backendu
├── frontend/             # Aplikacja Next.js
│   └── src/              # Kod źródłowy frontendu
├── .venv/                # Wirtualne środowisko Python
├── pyproject.toml        # Konfiguracja narzędzi Python
├── .flake8               # Konfiguracja flake8
├── .pylintrc             # Konfiguracja pylint
├── .pre-commit-config.yaml  # Konfiguracja pre-commit
└── Makefile              # Komendy Make dla backendu
```
