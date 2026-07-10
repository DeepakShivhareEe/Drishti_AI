import cv2
import numpy as np
import os
import re
import os

def resize_image(image, max_width=800):
    """Resize image maintaining aspect ratio."""
    height, width = image.shape[:2]
    if width > max_width:
        ratio = max_width / width
        new_size = (max_width, int(height * ratio))
        return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)
    return image

def preprocess_for_color(image):
    """Convert to HSV for color analysis."""
    blurred = cv2.GaussianBlur(image, (5, 5), 0)
    return cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

def detect_edges(image):
    """Detect edges using Canny edge detection."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    return edges

def calculate_edge_density(image):
    """Calculate the ratio of edge pixels to total pixels in the cropped image."""
    edges = detect_edges(image)
    edge_pixels = np.count_nonzero(edges)
    total_pixels = edges.shape[0] * edges.shape[1]
    return (edge_pixels / total_pixels) * 100 if total_pixels > 0 else 0

def get_dominant_color_score(hsv_image, hsv_ranges):
    """Calculate how much of the image falls within the given HSV ranges."""
    total_mask = np.zeros(hsv_image.shape[:2], dtype="uint8")
    for lower, upper in hsv_ranges:
        lower_bound = np.array(lower, dtype="uint8")
        upper_bound = np.array(upper, dtype="uint8")
        mask = cv2.inRange(hsv_image, lower_bound, upper_bound)
        total_mask = cv2.bitwise_or(total_mask, mask)
        
    matching_pixels = cv2.countNonZero(total_mask)
    total_pixels = hsv_image.shape[0] * hsv_image.shape[1]
    return (matching_pixels / total_pixels) * 100 if total_pixels > 0 else 0

def extract_texture_features(image):
    """Variance based texture feature extraction."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance = np.var(gray)
    score = min(100, (variance / 3000) * 100)
    return score

def order_points(pts):
    """Order points in top-left, top-right, bottom-right, bottom-left order."""
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def extract_banknote(image):
    """Finds the largest rectangular contour and applies a perspective transform."""
    original = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    
    kernel = np.ones((5,5), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    edges = cv2.erode(edges, kernel, iterations=1)

    contours, _ = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return image, _calculate_simple_aspect_ratio(image)

    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
    
    screen_cnt = None
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            screen_cnt = approx
            break

    if screen_cnt is None:
        c = contours[0]
        x, y, w, h = cv2.boundingRect(c)
        cropped = original[y:y+h, x:x+w]
        return cropped, (w/h if w > h else h/w)

    pts = screen_cnt.reshape(4, 2)
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))

    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(original, M, (maxWidth, maxHeight))
    
    aspect_ratio = maxWidth / maxHeight if maxWidth > maxHeight else maxHeight / maxWidth
    return warped, aspect_ratio

def _calculate_simple_aspect_ratio(image):
    h, w = image.shape[:2]
    return w/h if w > h else h/w

def check_aspect_ratio(actual_ratio, expected_ratio, tolerance=0.1):
    """Check if aspect ratio matches expected ratio within tolerance."""
    difference = abs(actual_ratio - expected_ratio)
    score = max(0, 100 - (difference * 100 / tolerance))
    return score

def orb_feature_match(image, denomination):
    """
    Matches microscopic keypoints (like RBI text, Gandhi's lines) using ORB.
    If a template for the denomination exists in 'templates/', it compares them.
    If not, it uses a high-frequency heuristic to catch 'toy' notes.
    """
    try:
        # Define template path relative to this script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        template_path = os.path.join(base_dir, "templates", f"{denomination}.jpg")
        
        # If we have a reference template, perform true ORB matching
        if os.path.exists(template_path):
            template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
            gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Initialize ORB detector
            orb = cv2.ORB_create(nfeatures=1000)
            
            # Find keypoints and descriptors
            kp1, des1 = orb.detectAndCompute(template, None)
            kp2, des2 = orb.detectAndCompute(gray_image, None)
            
            if des1 is None or des2 is None:
                return 0
                
            # Brute Force Matcher with Hamming distance
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            
            # Sort matches by distance (best first)
            matches = sorted(matches, key=lambda x: x.distance)
            
            # Number of good matches (arbitrary threshold based on testing)
            good_matches = [m for m in matches if m.distance < 50]
            
            score = min(100, (len(good_matches) / 50) * 100)
            return score
        else:
            # FALLBACK HEURISTIC (If no template is found)
            # 'Manoranjan Bank' / Toy notes often have very thick, high contrast text and less fine detail.
            # We check the ratio of fine edges to thick edges.
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Fine edges (Canny with high thresholds)
            fine_edges = cv2.Canny(gray, 100, 200)
            fine_count = np.count_nonzero(fine_edges)
            
            # Thick edges (Canny with low thresholds on a slightly blurred image)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            thick_edges = cv2.Canny(blur, 30, 100)
            thick_count = np.count_nonzero(thick_edges)
            
            # Real notes have a huge amount of fine micro-lines compared to thick structural lines.
            # Toy notes have bold printed text and fewer micro-lines.
            if thick_count == 0: return 0
            
            ratio = fine_count / thick_count
            
            # Normal real notes usually have ratio > 0.6. Toy notes often have ratio < 0.4.
            score = max(0, min(100, (ratio - 0.3) * 200))
            return score
            
    except Exception as e:
        print(f"[ORB Match Error] {e}")
        return 0

# --- OCR TEXT DETECTION ---
ocr_reader = None

def get_ocr_reader():
    global ocr_reader
    if ocr_reader is None:
        import sys
        import os
        original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        try:
            import easyocr
            import logging
            logging.getLogger("easyocr").setLevel(logging.ERROR)
            # Initialize with English, CPU mode to be safe across systems
            ocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        except Exception as e:
            sys.stdout = original_stdout
            print(f"Failed to initialize OCR: {e}")
        finally:
            if not sys.stdout.closed and sys.stdout != original_stdout:
                sys.stdout.close()
            sys.stdout = original_stdout
    return ocr_reader

def perform_text_analysis(image):
    """
    Scans the image text for known counterfeit signatures like '000000' or 'Manoranjan'.
    Returns a dictionary with 'penalty' (0-100) and 'found_words'.
    """
    reader = get_ocr_reader()
    if reader is None:
        return {"penalty": 0, "found_words": [], "status": "OCR_UNAVAILABLE"}
        
    # Convert to grayscale for faster OCR
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Read text
    results = reader.readtext(gray)
    text_fragments = [res[1].lower() for res in results]
    combined_text = " ".join(text_fragments)
    
    penalty = 0
    found_bad_words = []
    
    # 1. Serial Number Check
    # '000000' is the classic toy note serial number. OCR might read 0s as Os.
    import re
    if '00000' in combined_text or 'ooooo' in combined_text or re.search(r'[0oO]{5,}', combined_text):
        penalty = 100
        found_bad_words.append("000000 (Fake Serial)")
        
    # 2. Blacklisted Words Check
    bad_words = ['manoranjan', 'children', 'churan', 'full of fun', 'bacchon', 'toy', 'school bank', 'specimen']
    for word in bad_words:
        if word in combined_text:
            penalty = 100
            found_bad_words.append(word.upper())
            
    # 3. Missing 'Reserve Bank' Check
    if len(combined_text) > 20 and 'reserve' not in combined_text and 'rbi' not in combined_text:
        if penalty == 0:
            penalty = 30
            found_bad_words.append("Missing RBI Text")
            
    # 4. Denomination Check
    denominations = ['2000', '500', '200', '100', '50', '20', '10']
    ocr_denom = None
    
    # Check in descending order so '500' is caught before '50' or '00'
    for d in denominations:
        # EasyOCR sometimes outputs "₹500" or ",500" which breaks strict word boundaries (\b)
        if d in combined_text:
            ocr_denom = d
            break
            
    # Print for debugging in logs
    print(f"OCR Combined Text: {combined_text}")
    print(f"OCR Detected Denom: {ocr_denom}")
            
    return {
        "penalty": penalty,
        "found_words": found_bad_words,
        "ocr_denomination": ocr_denom,
        "status": "SUCCESS"
    }
