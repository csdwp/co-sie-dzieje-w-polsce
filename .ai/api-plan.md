# Plan API - Co się dzieje w Polsce? (MVP)

## Architektura

- **95% ruchu** → Statyczne strony (SSG) via `getActsAndKeywords()` podczas
  build
- **5% ruchu** → Jeden endpoint admina do edycji treści
- **Zero publicznych endpointów** → Wszystko przez SSG

---

## POST /api/admin/update-act

Aktualizuje treść aktu o niskiej pewności i triggeruje rebuild frontendu.

**Autentykacja:** Wymagana (rola Admin w Clerk)

### Request

```json
{
  "actId": 123,
  "content": "Poprawiona treść streszczenia...",
  "simpleTitle": "Poprawiony tytuł",
  "impactSection": "Poprawiony opis wpływu"
}
```

### Response - Sukces (200)

```json
{
  "success": true,
  "message": "Akt zaktualizowany. Rebuild w toku (~2-5 min).",
  "data": {
    "id": 123,
    "confidenceScore": 9.99,
    "updatedAt": "2025-10-15T10:30:00Z"
  }
}
```

### Response - Błędy

| Kod | Opis                     |
| --- | ------------------------ |
| 401 | Brak autentykacji        |
| 403 | Brak roli admin          |
| 404 | Akt nie istnieje         |
| 400 | Błąd walidacji           |
| 500 | Błąd serwera/bazy danych |

### Walidacja

**Pola:**

- `actId` - wymagane, liczba > 0
- `content` - opcjonalne, max 50000 znaków
- `simpleTitle` - opcjonalne, max 500 znaków
- `impactSection` - opcjonalne, max 10000 znaków

**Reguły biznesowe:**

1. Jeśli `confidence_score < 0.50` → ustaw na `9.99` (akt staje się publiczny)
2. Admin może edytować każdy akt (niezależnie od `confidence_score`)
3. Automatyczna aktualizacja `updated_at` na NOW()
4. Trigger webhook Vercel rebuild po zapisie

### Implementacja

```typescript
// 1. Sprawdź autentykację (Clerk)
// 2. Sprawdź rolę admin
// 3. Waliduj input (Zod)
// 4. UPDATE w bazie (Prisma) + confidence_score = 9.99
// 5. Trigger rebuild (POST do VERCEL_DEPLOY_HOOK_URL)
// 6. Zwróć response
```

---
