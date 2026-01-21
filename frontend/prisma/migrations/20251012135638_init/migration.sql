-- CreateTable
CREATE TABLE "acts" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "act_number" TEXT,
    "simple_title" TEXT,
    "content" TEXT,
    "refs" JSONB,
    "texts" JSONB,
    "item_type" VARCHAR(50),
    "announcement_date" DATE,
    "change_date" TIMESTAMP(6),
    "promulgation" DATE,
    "item_status" VARCHAR(50),
    "comments" TEXT,
    "keywords" TEXT[],
    "file" TEXT,
    "votes" JSONB,
    "category" TEXT,
    "idempotency_key" VARCHAR(255),
    "impact_section" TEXT,
    "confidence_score" DECIMAL(3,2),
    "needs_reprocess" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "ingested_at" TIMESTAMPTZ,

    CONSTRAINT "acts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "category" TEXT,
    "keywords" JSON,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "keyword" TEXT NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("keyword")
);

-- CreateIndex
CREATE UNIQUE INDEX "acts_idempotency_key_key" ON "acts"("idempotency_key");
