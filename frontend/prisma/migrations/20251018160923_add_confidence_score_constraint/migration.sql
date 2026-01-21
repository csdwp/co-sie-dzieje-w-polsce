-- Add CHECK constraint to ensure confidence_score is between 0 and 1
-- This migration addresses code review feedback for deterministic schema management

-- Add CHECK constraint for confidence_score range validation
ALTER TABLE "acts" ADD CONSTRAINT "acts_confidence_score_range" 
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

-- Set explicit DEFAULT NULL for confidence_score (idempotent operation)
ALTER TABLE "acts" ALTER COLUMN "confidence_score" SET DEFAULT NULL;

-- Set explicit DEFAULT NULL for ingested_at (idempotent operation)
ALTER TABLE "acts" ALTER COLUMN "ingested_at" SET DEFAULT NULL;

