# Use a lightweight official Python runtime
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install critical system libraries required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies (this might take a few minutes for PyTorch)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your agent's code into the container
COPY . .

# Expose Port 8001 to the outside world
EXPOSE 8001

# Command to run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]