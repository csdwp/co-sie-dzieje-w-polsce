-- AlterTable: Add missing columns if they don't exist
-- This migration ensures backward compatibility with existing data

-- Add confidence_score column if it doesn't exist (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acts' AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE "acts" ADD COLUMN "confidence_score" DECIMAL(3,2);
    END IF;
END $$;

-- Add created_at column with default if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acts' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE "acts" ADD COLUMN "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add updated_at column with default if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acts' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "acts" ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add needs_reprocess column with default if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acts' AND column_name = 'needs_reprocess'
    ) THEN
        ALTER TABLE "acts" ADD COLUMN "needs_reprocess" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add ingested_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'acts' AND column_name = 'ingested_at'
    ) THEN
        ALTER TABLE "acts" ADD COLUMN "ingested_at" TIMESTAMPTZ;
    END IF;
END $$;

