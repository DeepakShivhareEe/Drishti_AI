# Currency Detector Module

This is a standalone, purely image-based Indian Currency Detector. It uses OpenCV and OCR to detect the denomination of a note and calculate an authenticity score based on color, aspect ratio, micro-patterns, and text (to catch toy notes like "Manoranjan Bank").

## Setup

This module is 100% self-contained. Simply copy this folder into your project.

### Install Dependencies
```bash
pip install -r requirements.txt
```
*(Note: It will install `easyocr` and `torch` which might take some time to download the first time).*

## Usage

You can use the `CurrencyAnalyzer` anywhere in your code. It expects the raw bytes of an image file.

```python
from currency_detector import CurrencyAnalyzer

# Initialize the analyzer
analyzer = CurrencyAnalyzer()

# Read your image file as bytes
with open("test_note.jpg", "rb") as f:
    image_bytes = f.read()

# Analyze
result = analyzer.analyze(image_bytes)
print(result)
```

## How It Works
- **Color Histogram**: Checks if the color matches the strict RBI stone grey/green standards.
- **Aspect Ratio**: Crops out backgrounds and measures the exact physical ratio of the note.
- **Pattern Match (ORB / Heuristics)**: Looks at micro-lines.
- **OCR Text Analysis**: Uses AI to read the serial numbers and text to instantly fail fake toy notes.
