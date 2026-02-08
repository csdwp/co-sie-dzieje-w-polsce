#!/bin/bash

# Activate virtual environment
source app/venv/bin/activate

# Run the pipeline
python3 -m app.pipeline.run_pipeline

