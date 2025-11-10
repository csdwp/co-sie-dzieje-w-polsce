.PHONY: format lint type-check check install-dev

# Python executable from virtual environment
PYTHON = .venv/bin/python3
PIP = .venv/bin/pip
BLACK = .venv/bin/black
ISORT = .venv/bin/isort
FLAKE8 = .venv/bin/flake8
MYPY = .venv/bin/mypy

format:
	$(BLACK) backend/app/
	$(ISORT) backend/app/

lint:
	$(FLAKE8) backend/app/

type-check:
	$(MYPY) backend/app/

check: format lint type-check
	@echo "✅ All checks passed!"

install-dev:
	$(PIP) install black isort flake8 mypy pylint pre-commit

type-check-file:
	$(MYPY) $(FILE)