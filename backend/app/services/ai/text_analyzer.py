"""Text analysis service using AI."""

from typing import Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter

from ...core.exceptions import AIServiceError
from ...core.logging import get_logger
from ...models.act import ActAnalysis
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
            "Podsumuj ten fragment dokumentu prawnego w języku polskim w 2-3 zwięzłych zdaniach, "
            "wychwytując kluczowe zmiany lub przepisy. Skup się na istocie, unikając zbędnych szczegółów."
        )

        result = self.openai_client.analyze_with_prompt(
            text=text, prompt=prompt, max_tokens=200, expect_json=False
        )
        return str(result.get("content", ""))

    def analyze_full_text(
        self, text: str, chunk_size: int = 3000, chunk_overlap: int = 200
    ) -> ActAnalysis:
        """
        Analyze full legal text by splitting into chunks and summarizing.

        Args:
            text: Full text to analyze
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks

        Returns:
            ActAnalysis with title and content
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

        # Combine summaries
        combined_summary = "\n".join(summaries)
        logger.info(
            f"Combined summaries, total length: {len(combined_summary)} characters"
        )

        # Generate final analysis
        analysis_prompt = (
            "Napisz jasne i zwięzłe podsumowanie zmiany prawnej w języku polskim, odpowiednie dla wiadomości na stronie głównej lub powiadomienia push. "
            'Zwróć wynik jako obiekt JSON z dwoma polami: "title": krótki, informacyjny nagłówek (maks. 8 słów, neutralny ton, bez języka pierwszoosobowego), '
            '"content_html": lekki tekst HTML (<p>, <ul>, <li>, <strong>), zawierający: Nieco rozszerzone wyjaśnienie, co się zmieniło (3-5 zdań), '
            "Jeśli istotne, proste wyjaśnienie konsekwencji lub skutków zmiany (1-2 zdania), "
            'Unikaj zbędnych porównań typu "przed i po". Skup się na samej zmianie, bez wyraźnego porównania jej z przeszłością, chyba że jest to konieczne dla kontekstu. '
            'Pisz neutralnym i profesjonalnym tonem. Unikaj niepotrzebnych wstępów ("ten tekst informuje..."). '
            "Dane wejściowe to połączone streszczenie większego dokumentu prawnego; przedstaw spójne podsumowanie na tej podstawie. "
            "**Cała treść musi być napisana w języku polskim.**"
        )

        result = self.openai_client.analyze_with_prompt(
            text=combined_summary,
            prompt=analysis_prompt,
            max_tokens=1000,
            expect_json=True,
        )

        if isinstance(result, dict) and "title" in result and "content_html" in result:
            return ActAnalysis(
                title=result["title"], content_html=result["content_html"]
            )
        else:
            logger.error(f"Unexpected analysis result format: {result}")
            raise AIServiceError("Failed to parse analysis result")
