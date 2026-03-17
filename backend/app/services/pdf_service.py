import os
from typing import Optional

import fitz
import requests

from ..core.config import PDF_DOWNLOAD_TIMEOUT


def download_pdf(url: str, filename: str = "temp.pdf") -> Optional[str]:
    try:
        response = requests.get(url, timeout=PDF_DOWNLOAD_TIMEOUT, stream=True)
        response.raise_for_status()

        if not response.content:
            print(f"Warning: Empty PDF of {url}")
            return None

        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        return filename
    except requests.exceptions.RequestException as e:
        print(f"Error while downloading PDF: {e}")
        return None


def pdf_to_text(url: str) -> Optional[str]:
    temp_file = None
    text = ""
    try:
        temp_file = download_pdf(url)
        if not temp_file or not os.path.exists(temp_file):
            print(f"Error: PDF file not downloaded correctly from {url}")
            return None

        doc = fitz.open(temp_file)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error while processing PDF: {e}")
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except OSError as e:
                print(f"Warning: Unable to remove temporary file: {e}")
    return text if text else None


def save_text_to_file(text: str, filename: str) -> bool:
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"✅ Text saved to file: {filename}")
        return True
    except Exception as e:
        print(f"❌ Error while saving to file: {e}")
        return False
