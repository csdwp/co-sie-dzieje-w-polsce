# DB Schema - Co się dzieje w Polsce?

## Tables

### acts

- id: SERIAL PRIMARY KEY NOT NULL
- title: TEXT NULL
- act_number: TEXT NULL
- simple_title: TEXT NULL
- content: TEXT NULL
- refs: JSONB NULL
- texts: JSONB NULL
- item_type: VARCHAR(50) NULL
- announcement_date: DATE NULL
- change_date: TIMESTAMP(6) NULL
- promulgation: DATE NULL
- item_status: VARCHAR(50) NULL
- comments: TEXT NULL
- keywords: TEXT[] NOT NULL
- file: TEXT NULL
- votes: JSONB NULL
- category: TEXT NULL
- idempotency_key: VARCHAR(255) UNIQUE NULL
- impact_section: TEXT NULL
- confidence_score: DECIMAL(3,2) NULL
- needs_reprocess: BOOLEAN DEFAULT FALSE NOT NULL
- created_at: TIMESTAMPTZ DEFAULT NOW() NOT NULL
- updated_at: TIMESTAMPTZ NOT NULL
- ingested_at: TIMESTAMPTZ NULL

### category

- id: SERIAL PRIMARY KEY NOT NULL
- category: TEXT NULL
- keywords: JSON NULL

### keywords

- keyword: TEXT PRIMARY KEY NOT NULL

## Relations

None defined yet

## Indexes

- acts_pkey: acts.id
- category_pkey: category.id
- keywords_pkey: keywords.keyword
- idx_acts_idempotency_key: acts.idempotency_key (UNIQUE)

## Notes

- Schemat zsynchronizowany z rzeczywistą bazą (na podstawie migracji init)
- Tabela category używa surrogate key (id) zamiast natural key (category)
- Dodana tabela keywords jako słownik słów kluczowych
- Brak triggera updated_at (trzeba dodać jeśli potrzebny)
- No RLS in MVP (Clerk handles auth)
