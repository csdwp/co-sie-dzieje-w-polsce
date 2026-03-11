"""Text analysis service using AI."""

from typing import Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter

from ...core.exceptions import AIServiceError
from ...core.logging import get_logger
from ...models.act import ActAnalysis, AnalysisResult
from ..external.openai_client import OpenAIClient

logger = get_logger(__name__)


class TextAnalyzer:
    """Service for analyzing legal text using AI."""

    def __init__(self, openai_client: Optional[OpenAIClient] = None):
        """
        Initialize text analyzer.

        Args:
            openai_client: OpenAI client instance
        """
        self.openai_client = openai_client or OpenAIClient()

    def summarize_fragment(self, text: str) -> str:
        """
        Summarize a fragment of legal text.

        Args:
            text: Text fragment to summarize

        Returns:
            Summary text
        """
        prompt = (
            "Jesteś ekspertem od prawa polskiego tłumaczącym przepisy zwykłym obywatelom. "
            "Podsumuj ten fragment dokumentu prawnego w 2-3 zdaniach po polsku. "
            "Zachowaj konkretne szczegóły: kwoty, kary, terminy, progi, daty wejścia w życie "
            "oraz grupy osób lub podmiotów, których dotyczą zmiany. "
            "Pomiń formalne odniesienia do artykułów i numerów ustaw — "
            "skup się na tym, co faktycznie się zmienia i kogo to dotyczy."
        )

        result = self.openai_client.analyze_with_prompt(
            text=text, prompt=prompt, max_tokens=350, expect_json=False
        )
        return str(result.get("content", ""))

    def analyze_full_text(
        self, text: str, chunk_size: int = 3000, chunk_overlap: int = 500
    ) -> AnalysisResult:
        """
        Analyze full legal text by splitting into chunks and summarizing.

        Args:
            text: Full text to analyze
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks

        Returns:
            AnalysisResult with ActAnalysis and original chunks
        """
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap, length_function=len
        )
        chunks = text_splitter.split_text(text)
        logger.info(f"Split text into {len(chunks)} chunks")

        # Summarize each chunk
        summaries = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Summarizing chunk {i+1}/{len(chunks)}")
            summary = self.summarize_fragment(chunk)
            summaries.append(summary)

        # Combine summaries with structural markers so the final model
        # understands document order and can resolve cross-references
        total = len(summaries)
        combined_summary = "\n\n".join(
            f"[Fragment {i + 1}/{total}]\n{s}" for i, s in enumerate(summaries)
        )
        logger.info(
            f"Combined summaries, total length: {len(combined_summary)} characters"
        )

        # Generate final analysis
        analysis_prompt = (
            "Jesteś redaktorem serwisu obywatelskiego tłumaczącym zmiany prawne Polakom bez wykształcenia prawniczego. "
            "Na podstawie poniższych streszczeń fragmentów dokumentu prawnego napisz końcowe podsumowanie. "
            'Zwróć JSON z polami "title" i "content_html". '
            '"title": konkretny nagłówek max 8 słów opisujący co się faktycznie zmienia — nie nazwę ustawy, neutralny ton. '
            '"content_html": treść w HTML używając tylko <p>, <ul>, <li>, <strong>. '
            "Zasady dla content_html: "
            "1. Zacznij od najważniejszego faktu — tego co czytelnik powinien wiedzieć w pierwszej kolejności. "
            "2. Wyjaśnij kogo dotyczy zmiana (pracownicy, firmy, emeryci, kierowcy, wszyscy obywatele itp.). "
            "3. Uwzględnij konkretne liczby: kwoty, kary, terminy, progi — jeśli są w tekście, muszą być w podsumowaniu. "
            "4. Jeśli to zmiana istniejącego przepisu, powiedz krótko jak było i jak będzie — to ułatwia zrozumienie. "
            "5. Zakończ jednym zdaniem o skutkach praktycznych jeśli są istotne. "
            "6. Pisz prostym aktywnym językiem — jakbyś wyjaśniał znajomemu, nie prawnikowi. "
            'Unikaj pustych wstępów ("Ustawa ta...", "Przepisy dotyczą..."). '
            "Cała treść po polsku."
        )

        result = self.openai_client.analyze_with_prompt(
            text=combined_summary,
            prompt=analysis_prompt,
            max_tokens=1000,
            expect_json=True,
        )

        if isinstance(result, dict) and "title" in result and "content_html" in result:
            return AnalysisResult(
                analysis=ActAnalysis(
                    title=result["title"], content_html=result["content_html"]
                ),
                chunks=chunks,
            )
        else:
            logger.error(f"Unexpected analysis result format: {result}")
            raise AIServiceError("Failed to parse analysis result")
