"""
Before/after comparison of summary quality.

Usage (from backend/app/):
    python compare_summaries.py <pdf_url>

Example:
    python compare_summaries.py https://isap.nsf.gov.pl/download.xsp/WDU20240000001/T/D20240001L.pdf
"""

import os
import re
import sys
import textwrap

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore[no-redef]

from app.services.external.openai_client import OpenAIClient
from app.services.external.pdf_processor import PDFProcessor

SEP = "─" * 72


def summarize_fragment_old(client: OpenAIClient, text: str) -> str:
    prompt = (
        "Podsumuj ten fragment dokumentu prawnego w języku polskim w 2-3 zwięzłych zdaniach, "
        "wychwytując kluczowe zmiany lub przepisy. Skup się na istocie, unikając zbędnych szczegółów."
    )
    result = client.analyze_with_prompt(
        text=text, prompt=prompt, max_tokens=200, expect_json=False
    )
    return str(result.get("content", ""))


def summarize_fragment_new(client: OpenAIClient, text: str) -> str:
    prompt = (
        "Jesteś ekspertem od prawa polskiego tłumaczącym przepisy zwykłym obywatelom. "
        "Podsumuj ten fragment dokumentu prawnego w 2-3 zdaniach po polsku. "
        "Zachowaj konkretne szczegóły: kwoty, kary, terminy, progi, daty wejścia w życie "
        "oraz grupy osób lub podmiotów, których dotyczą zmiany. "
        "Pomiń formalne odniesienia do artykułów i numerów ustaw — "
        "skup się na tym, co faktycznie się zmienia i kogo to dotyczy."
    )
    result = client.analyze_with_prompt(
        text=text, prompt=prompt, max_tokens=350, expect_json=False
    )
    return str(result.get("content", ""))


def run_old(text: str) -> dict:
    client = OpenAIClient(model="gpt-3.5-turbo")
    splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200)
    chunks = splitter.split_text(text)
    print(f"  [OLD] {len(chunks)} chunks")

    summaries = [summarize_fragment_old(client, c) for c in chunks]
    combined = "\n".join(summaries)

    final_prompt = (
        "Napisz jasne i zwięzłe podsumowanie zmiany prawnej w języku polskim, odpowiednie dla wiadomości na stronie głównej lub powiadomienia push. "
        'Zwróć wynik jako obiekt JSON z dwoma polami: "title": krótki, informacyjny nagłówek (maks. 8 słów, neutralny ton, bez języka pierwszoosobowego), '
        '"content_html": lekki tekst HTML (<p>, <ul>, <li>, <strong>), zawierający: Nieco rozszerzone wyjaśnienie, co się zmieniło (3-5 zdań), '
        "Jeśli istotne, proste wyjaśnienie konsekwencji lub skutków zmiany (1-2 zdania), "
        'Unikaj zbędnych porównań typu "przed i po". Skup się na samej zmianie, bez wyraźnego porównania jej z przeszłością, chyba że jest to konieczne dla kontekstu. '
        'Pisz neutralnym i profesjonalnym tonem. Unikaj niepotrzebnych wstępów ("ten tekst informuje..."). '
        "Dane wejściowe to połączone streszczenie większego dokumentu prawnego; przedstaw spójne podsumowanie na tej podstawie. "
        "**Cała treść musi być napisana w języku polskim.**"
    )
    result = client.analyze_with_prompt(
        text=combined, prompt=final_prompt, max_tokens=1000, expect_json=True
    )
    return result


def run_new(text: str) -> dict:
    client = OpenAIClient(model="gpt-4o-mini")
    splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=500)
    chunks = splitter.split_text(text)
    print(f"  [NEW] {len(chunks)} chunks")

    total = len(chunks)
    summaries = [summarize_fragment_new(client, c) for c in chunks]
    combined = "\n\n".join(
        f"[Fragment {i + 1}/{total}]\n{s}" for i, s in enumerate(summaries)
    )

    final_prompt = (
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
    result = client.analyze_with_prompt(
        text=combined, prompt=final_prompt, max_tokens=1000, expect_json=True
    )
    return result


def strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html).strip()


def print_result(label: str, result: dict) -> None:
    print(f"\n{SEP}")
    print(f"  {label}")
    print(SEP)
    title = result.get("title", "[no title]")
    content = strip_html(result.get("content_html", "[no content]"))
    print(f"  TITLE:   {title}")
    print("\n  CONTENT:")
    for line in textwrap.wrap(content, width=68):
        print(f"    {line}")


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python compare_summaries.py <pdf_url>")
        print("Example PDF URLs from isap.sejm.gov.pl:")
        print("  https://isap.nsf.gov.pl/download.xsp/WDU20240000001/T/D20240001L.pdf")
        sys.exit(1)

    pdf_url = sys.argv[1]
    print(f"\nDownloading PDF: {pdf_url}")

    processor = PDFProcessor()
    text = processor.download_and_extract(pdf_url)

    if not text:
        print("ERROR: Could not extract text from PDF.")
        sys.exit(1)

    print(f"Extracted {len(text)} characters\n")

    print("Running OLD config (gpt-3.5-turbo, overlap=200, max_tokens=200)...")
    old_result = run_old(text)

    print("Running NEW config (gpt-4o-mini, overlap=500, max_tokens=350)...")
    new_result = run_new(text)

    print_result("BEFORE  (gpt-3.5-turbo / old prompts)", old_result)
    print_result("AFTER   (gpt-4o-mini / new prompts)", new_result)
    print(f"\n{SEP}\n")


if __name__ == "__main__":
    main()
