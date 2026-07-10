import cv2
import numpy as np
import io
from PIL import Image

from .denomination_profiles import DENOMINATION_PROFILES
from . import utils

class CurrencyAnalyzer:
    """
    Standalone Image-Based Currency Detector Engine.
    Uses OpenCV to auto-crop the banknote and analyze security features.
    """
    def __init__(self):
        pass

    def analyze(self, image_bytes: bytes) -> dict:
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            open_cv_image = np.array(pil_image)
            image_bgr = open_cv_image[:, :, ::-1].copy()
        except Exception as e:
            return {"error": f"Failed to load image: {str(e)}"}

        # 1. Base Resize
        resized_image = utils.resize_image(image_bgr, max_width=1000)
        
        # 2. Extract Banknote (Auto-Cropping & Flattening)
        cropped_note, extracted_ratio = utils.extract_banknote(resized_image)
        
        hsv_image = utils.preprocess_for_color(cropped_note)
        
        # 3. Detect Denomination
        best_match = None
        highest_color_score = 0
        
        for denom, profile in DENOMINATION_PROFILES.items():
            score = utils.get_dominant_color_score(hsv_image, profile["hsv_ranges"])
            if score > highest_color_score:
                highest_color_score = score
                best_match = denom
                
        if highest_color_score < 10: 
            return {
                "status": "UNKNOWN",
                "denomination": None,
                "confidence_score": 0,
                "message": "Could not confidently identify a valid Indian currency note (Color threshold failed).",
                "features": {
                    "color_match": 0,
                    "aspect_ratio": 0,
                    "pattern_match": 0,
                    "texture_quality": 0
                }
            }
            
        profile = DENOMINATION_PROFILES[best_match]
        
        # 4. Authenticity Scoring
        
        # A. Aspect Ratio (Increased tolerance for photos with hands/backgrounds)
        ratio_score = utils.check_aspect_ratio(extracted_ratio, profile["aspect_ratio"], tolerance=0.35)
        
        # B. Color Score
        color_score = min(100, highest_color_score * 3)
        
        # C. Texture Uniformity
        texture_score = utils.extract_texture_features(cropped_note)
        
        # D. Security Pattern Matching (ORB or Micro-Line Heuristic)
        # This targets "Manoranjan Bank" / Toy notes directly
        pattern_score = utils.orb_feature_match(cropped_note, best_match)
        
        # E. Text Analysis (OCR)
        # Check for bad serial numbers and blacklisted words, and also extract denomination
        text_result = utils.perform_text_analysis(cropped_note)
        text_penalty = text_result.get("penalty", 0)
        found_bad_words = text_result.get("found_words", [])
        ocr_denom = text_result.get("ocr_denomination")
        
        # Override denomination if OCR successfully read a number clearly.
        # This prevents color matching failures (e.g., 500 grey misclassified as 10 brown under warm light)
        if ocr_denom and ocr_denom in DENOMINATION_PROFILES:
            best_match = ocr_denom
            profile = DENOMINATION_PROFILES[best_match]
            # Recalculate ratio score with the newly confirmed profile
            ratio_score = utils.check_aspect_ratio(extracted_ratio, profile["aspect_ratio"], tolerance=0.35)
            
        # 5. Calculate Overall Score
        # Now heavily weighted on the Security Pattern and Color
        weights = {
            "color": 0.30,
            "ratio": 0.10, # Reduced weight for ratio since cropping isn't always perfect
            "pattern": 0.50,  # Critical weight for finding fake 'toy' prints
            "texture": 0.10
        }
        
        overall_score = (
            (color_score * weights["color"]) +
            (ratio_score * weights["ratio"]) +
            (pattern_score * weights["pattern"]) +
            (texture_score * weights["texture"])
        )
        
        # Apply text penalty (If OCR found '000000' or 'Manoranjan')
        overall_score = overall_score - text_penalty
        overall_score = min(100, max(0, overall_score))
        
        # 6. Determine Verdict Strictly
        # If the security pattern completely fails (like Manoranjan notes), hard fail it.
        if text_penalty >= 100:
            status = "COUNTERFEIT SUSPECTED"
            bad_words_str = ", ".join(found_bad_words)
            message = f"Critical failure: Detected counterfeit text/serial numbers: {bad_words_str}."
            overall_score = 0 # Instant 0% for Manoranjan/Children bank
        elif pattern_score < 30 and color_score < 50:
            status = "COUNTERFEIT SUSPECTED"
            message = "Critical failure: Security patterns and colors do not match RBI standards (Possible toy/fake note)."
            overall_score = min(overall_score, 35) # Cap confidence for obvious fakes
        elif ratio_score < 10 and pattern_score < 50:
            status = "COUNTERFEIT SUSPECTED"
            message = "Warning: Shape and dimensions severely deviate from standards, and security patterns are weak."
            overall_score = min(overall_score, 45)
        elif overall_score >= 75:
            status = "GENUINE"
            message = "Visual features successfully match reserve standards."
        elif overall_score >= 50:
            status = "SUSPICIOUS"
            message = "Some visual anomalies detected. Manual inspection advised."
        else:
            status = "COUNTERFEIT SUSPECTED"
            message = "Warning: Multiple visual security features failed validation."

        return {
            "status": status,
            "denomination": best_match,
            "confidence_score": round(overall_score, 1),
            "message": message,
            "features": {
                "color_match": round(color_score, 1),
                "aspect_ratio": round(ratio_score, 1),
                "pattern_match": round(pattern_score, 1), # Replaced edge_sharpness in the UI
                "texture_quality": round(texture_score, 1)
            }
        }
