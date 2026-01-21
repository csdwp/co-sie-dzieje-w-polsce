#!/bin/bash

# Activate virtual environment
source app/venv/bin/activate

# Run the pipeline
python -m app.pipeline.run_pipeline

