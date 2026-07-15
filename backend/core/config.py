from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

# Server Settings
HOST = "0.0.0.0"
PORT = 8000
ALLOWED_ORIGINS = ["*"]
