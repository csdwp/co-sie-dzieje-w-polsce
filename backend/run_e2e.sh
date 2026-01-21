#!/bin/bash
cd "$(dirname "$0")"
export PYTHONPATH=$(pwd)
source app/venv/bin/activate
python -m pytest tests/e2e/ -v --tb=short