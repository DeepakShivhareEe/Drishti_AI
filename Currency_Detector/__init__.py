"""
Portable Image-Based Indian Currency Detector.
Uses OpenCV and rule-based feature matching to identify denomination 
and provide authenticity scoring based on visual characteristics.

No external APIs, no deep learning models, completely offline and self-contained.
"""

from .engine import CurrencyAnalyzer

__version__ = "1.0.0"
__all__ = ["CurrencyAnalyzer"]
