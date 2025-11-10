import json
import logging
import os
import time
from contextlib import contextmanager
from typing import Any, Dict, Generator, List, Optional, cast

from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore
from openai import APIError, OpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from ..db.database import create_new_category, extend_category_keywords
from ..models.act import CategoryData

logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

load_dotenv()


@contextmanager
def get_openai_client() -> Generator[OpenAI, None, None]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key missing.")

    client = OpenAI(api_key=api_key)
    try:
        yield client
    finally:
        client.close()


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type(APIError),
)
def analyze_text_with_openai(
    text: str, prompt: str, max_tokens: int = 1000
) -> Dict[str, Any]:
    logger.info(f"Processing text, length: {len(text)} characters")

    try:
        with get_openai_client() as client:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text},
                ],
                max_tokens=max_tokens,
            )
            content = response.choices[0].message.content

            if "json" in prompt.lower():
                try:
                    return cast(Dict[str, Any], json.loads(content if content is not None else "{}"))
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON format: {content}")
                    return {"error": "Invalid response format", "raw_content": content}
            return {"content": content or ""}
    except APIError as e:
        logger.error(f"API error: {e}")
        raise

    time.sleep(1.0)


def summarize_fragment(text: str) -> str:
    prompt = "Podsumuj ten fragment dokumentu prawnego w języku polskim w 2-3 zwięzłych zdaniach, wychwytując kluczowe zmiany lub przepisy. Skup się na istocie, unikając zbędnych szczegółów."
    result = analyze_text_with_openai(text, prompt, max_tokens=200)
    return str(result.get("content", ""))


def split_and_analyze_text(
    text: str, chunk_size: int = 3000, chunk_overlap: int = 200
) -> Dict[str, Any]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap, length_function=len
    )
    chunks = text_splitter.split_text(text)
    logger.info(f"Split into {len(chunks)} chunks")

    summaries = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Summarizing chunk {i+1}/{len(chunks)}")
        summary = summarize_fragment(chunk)
        summaries.append(summary)

    combined_summary = "\n".join(summaries)
    logger.info(f"Summaries combined, length: {len(combined_summary)} characters")

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
    return analyze_text_with_openai(combined_summary, analysis_prompt, max_tokens=1000)


def save_analysis_to_file(analysis: Dict[str, Any], filename: str) -> None:
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        logger.info(f"Analysis saved to {filename}")
    except Exception as e:
        logger.error(f"Save error: {e}")


def find_or_create_category_with_ai(
    act_keywords: List[str],
    all_categories: List[CategoryData],
    act_title: str = "",
    act_content: str = "",
) -> Optional[str]:
    if not act_keywords or not all_categories:
        return None

    categories_info = []
    for category_data in all_categories:
        # CategoryData już ma prawidłowy format - keywords są listą stringów
        categories_info.append(
            {"category": category_data.category, "keywords": category_data.keywords}
        )

    act_info = {
        "keywords": act_keywords,
        "title": act_title[:200] if act_title else "",
        "content_preview": act_content[:500] if act_content else "",
    }

    prompt = f"""
    Analizujesz akt prawny i musisz zdecydować o kategorii. Masz do wyboru:
    
    1. DOPASUJ do istniejącej kategorii - jeśli słowa kluczowe aktu pasują do jednej z istniejących kategorii
    2. ROZSZERZ istniejącą kategorię - jeśli akt pasuje do kategorii, ale ma nowe słowa kluczowe
    3. UTWÓRZ nową kategorię - jeśli akt nie pasuje do żadnej istniejącej kategorii
    
    ISTNIEJĄCE KATEGORIE:
    {json.dumps(categories_info, ensure_ascii=False, indent=2)}
    
    AKT DO KATEGORYZACJI:
    {json.dumps(act_info, ensure_ascii=False, indent=2)}
    
    Zwróć JSON w formacie:
    {{
        "action": "match|extend|create",
        "category_name": "nazwa_kategorii",
        "new_keywords": ["lista", "nowych", "słów", "kluczowych"],
        "reasoning": "krótkie uzasadnienie decyzji"
    }}
    
    ZASADY:
    - Dla "match": zwróć istniejącą nazwę kategorii, new_keywords może być puste
    - Dla "extend": zwróć istniejącą nazwę kategorii + nowe keywords do dodania
    - Dla "create": wymyśl nową nazwę kategorii + wszystkie keywords
    - Nazwy kategorii po polsku, krótkie, opisowe
    - Keywords to kluczowe terminy prawne, nie całe frazy
    """

    try:
        ai_decision = analyze_text_with_openai("", prompt, max_tokens=500)

        if isinstance(ai_decision, dict) and "action" in ai_decision:
            action = ai_decision.get("action")
            category_name = ai_decision.get("category_name")
            new_keywords = ai_decision.get("new_keywords", [])

            logger.info(
                f"AI decision: {ai_decision.get('reasoning', 'No reasoning provided')}"
            )

            if action == "match":
                if any(cat.category == category_name for cat in all_categories):
                    return category_name
                else:
                    logger.warning(
                        f"AI suggested non-existent category: {category_name}"
                    )
                    return None

            elif action == "extend":
                if category_name and new_keywords:
                    return extend_category_keywords(
                        category_name, new_keywords, all_categories
                    )

            elif action == "create":
                if category_name and new_keywords:
                    return create_new_category(
                        category_name, new_keywords + act_keywords
                    )

            return None

        else:
            logger.error(f"Invalid AI response format: {ai_decision}")
            return None

    except Exception as e:
        logger.error(f"Error in AI categorization: {e}")
        return None
