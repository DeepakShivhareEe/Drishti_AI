# Color profiles (HSV ranges) and physical properties of Indian Currency Notes
# Dimensions in mm

# Refined HSV ranges for more accurate color isolation
DENOMINATION_PROFILES = {
    "10": {
        "color_name": "Chocolate Brown",
        "hsv_ranges": [
            ([10, 50, 50], [25, 255, 200]),  # Brown/Orange hues
        ],
        "dimensions": (123, 63),
        "aspect_ratio": 123 / 63,
    },
    "20": {
        "color_name": "Greenish Yellow",
        "hsv_ranges": [
            ([25, 50, 50], [45, 255, 255]),  # Yellow/Green hues
        ],
        "dimensions": (129, 63),
        "aspect_ratio": 129 / 63,
    },
    "50": {
        "color_name": "Fluorescent Blue",
        "hsv_ranges": [
            ([90, 50, 50], [130, 255, 255]), # Blue hues
        ],
        "dimensions": (135, 66),
        "aspect_ratio": 135 / 66,
    },
    "100": {
        "color_name": "Lavender",
        "hsv_ranges": [
            ([125, 40, 50], [155, 200, 255]), # Purple/Lavender hues
        ],
        "dimensions": (142, 66),
        "aspect_ratio": 142 / 66,
    },
    "200": {
        "color_name": "Bright Yellow",
        "hsv_ranges": [
            ([15, 100, 100], [35, 255, 255]), # Bright Yellow hues
        ],
        "dimensions": (146, 66),
        "aspect_ratio": 146 / 66,
    },
    "500": {
        "color_name": "Stone Grey",
        "hsv_ranges": [
            # Note: Grey is tricky in HSV. Low saturation is key.
            # We look for low saturation and mid-to-high value.
            ([0, 0, 50], [180, 50, 220]), 
        ],
        "dimensions": (150, 66),
        "aspect_ratio": 150 / 66,
    },
    "2000": {
        "color_name": "Magenta",
        "hsv_ranges": [
            ([145, 50, 50], [175, 255, 255]), # Pink/Magenta hues
        ],
        "dimensions": (166, 66),
        "aspect_ratio": 166 / 66,
    }
}
