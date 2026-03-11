"""Text validation service using atomic claim verification."""

from typing import Dict, List, Optional

from ...core.logging import get_logger
from ...models.validation import ClaimVerification, ValidationReport
from ..external.openai_client import OpenAIClient

logger = get_logger(__name__)


class TextValidator:
    """Validates AI-generated summaries against source text using atomic claim verification."""

    def __init__(self, openai_client: Optional[OpenAIClient] = None):
        """
        Initialize text validator.

        Args:
            openai_client: OpenAI client instance
        """
        self.openai_client = openai_client or OpenAIClient()

    def validate(self, chunks: List[str], final_summary: str) -> ValidationReport:
        """
        Validate final summary against original source chunks.

        Two-step process:
        1. Extract atomic factual claims from summary
        2. Verify each claim against original chunks

        Args:
            chunks: Original text chunks from source document
            final_summary: AI-generated summary to validate

        Returns:
            ValidationReport with per-claim verification and overall confidence
        """
        claims = self._extract_claims(final_summary)

        if not claims:
            logger.warning("No claims extracted from summary")
            return ValidationReport(
                claims=[],
                overall_confidence=0.0,
                hallucinations=[],
                verdict="unreliable",
                recommendation="Nie udało się wyodrębnić twierdzeń z podsumowania.",
            )

        logger.info(
            f"Extracted {len(claims)} claims, verifying against {len(chunks)} chunks"
        )
        verified_claims = self._verify_claims(claims, chunks)
        return self._build_report(verified_claims)

    def _extract_claims(self, summary: str) -> List[str]:
        """Extract atomic factual claims from the summary."""
        prompt = (
            "Jesteś analitykiem tekstu prawnego. "
            "Wyodrębnij z poniższego podsumowania wszystkie atomowe twierdzenia faktyczne. "
            "Atomowe twierdzenie to pojedynczy, sprawdzalny fakt, np.: "
            "'kara wzrasta do 5000 zł', 'dotyczy pracodawców powyżej 50 pracowników', "
            "'wchodzi w życie 1 stycznia 2025'. "
            "Pomiń ogólne oceny i sformułowania bez konkretnych danych. "
            'Zwróć JSON: {"claims": ["twierdzenie 1", "twierdzenie 2", ...]}'
        )

        result = self.openai_client.analyze_with_prompt(
            text=summary, prompt=prompt, max_tokens=500, expect_json=True
        )

        claims = result.get("claims", [])
        if not isinstance(claims, list):
            return []
        return [str(c) for c in claims if c]

    def _verify_claims(
        self, claims: List[str], chunks: List[str]
    ) -> List[ClaimVerification]:
        """Verify each claim against source chunks, processing chunks in batches."""
        BATCH_CHAR_LIMIT = 9000

        batches: List[List[tuple]] = []
        current_batch: List[tuple] = []
        current_size = 0
        for i, chunk in enumerate(chunks):
            if current_size + len(chunk) > BATCH_CHAR_LIMIT and current_batch:
                batches.append(current_batch)
                current_batch = [(i, chunk)]
                current_size = len(chunk)
            else:
                current_batch.append((i, chunk))
                current_size += len(chunk)
        if current_batch:
            batches.append(current_batch)

        claim_supported: Dict[str, bool] = {c: False for c in claims}
        claim_evidence: Dict[str, Optional[int]] = {c: None for c in claims}
        claims_json = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(claims))

        prompt_template = (
            "Jesteś weryfikatorem faktów w dokumentach prawnych. "
            "Sprawdź każde z poniższych twierdzeń wobec tekstu źródłowego podanego przez użytkownika.\n\n"
            "Dla każdego twierdzenia określ:\n"
            "- supported: true jeśli tekst źródłowy to potwierdza, false jeśli nie ma pokrycia lub jest sprzeczność\n"
            "- evidence_chunk: numer fragmentu z dowodem (1-based) lub null\n\n"
            f"TWIERDZENIA:\n{claims_json}\n\n"
            'Zwróć JSON: {"verifications": [{"claim": "...", "supported": true, "evidence_chunk": 1}]}'
        )

        for batch in batches:
            source_text = "\n\n".join(
                f"[Fragment {orig_i + 1}]\n{chunk}" for orig_i, chunk in batch
            )
            result = self.openai_client.analyze_with_prompt(
                text=source_text,
                prompt=prompt_template,
                max_tokens=1500,
                expect_json=True,
            )

            verifications = result.get("verifications", [])
            if not isinstance(verifications, list):
                logger.warning("Unexpected verifications format for batch, skipping")
                continue

            for item in verifications:
                if not isinstance(item, dict):
                    continue
                claim_text = str(item.get("claim", ""))
                if claim_text not in claim_supported:
                    continue
                if bool(item.get("supported", False)):
                    claim_supported[claim_text] = True
                    raw_evidence = item.get("evidence_chunk")
                    if raw_evidence is not None:
                        try:
                            claim_evidence[claim_text] = int(raw_evidence)
                        except (ValueError, TypeError):
                            pass

        return [
            ClaimVerification(
                claim=c,
                supported=claim_supported[c],
                evidence_chunk=claim_evidence[c],
            )
            for c in claims
        ]

    def _build_report(
        self, verified_claims: List[ClaimVerification]
    ) -> ValidationReport:
        """Build ValidationReport from verified claims."""
        if not verified_claims:
            return ValidationReport(
                claims=[],
                overall_confidence=0.0,
                hallucinations=[],
                verdict="unreliable",
                recommendation="Brak twierdzeń do weryfikacji.",
            )

        supported = [c for c in verified_claims if c.supported]
        hallucinations = [c.claim for c in verified_claims if not c.supported]
        confidence = round(len(supported) / len(verified_claims), 2)

        if confidence >= 0.9:
            verdict = "reliable"
            recommendation = "Podsumowanie jest wiarygodne."
        elif confidence >= 0.6:
            verdict = "partially_reliable"
            recommendation = (
                f"Zweryfikuj ręcznie: {len(hallucinations)} "
                f"niepotwierdzonych twierdzeń na {len(verified_claims)}."
            )
        else:
            verdict = "unreliable"
            recommendation = (
                f"Podsumowanie zawiera {len(hallucinations)} niepotwierdzonych "
                f"twierdzeń na {len(verified_claims)} — wymaga przeprocesowania."
            )

        return ValidationReport(
            claims=verified_claims,
            overall_confidence=confidence,
            hallucinations=hallucinations,
            verdict=verdict,
            recommendation=recommendation,
        )
