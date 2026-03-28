FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for opencv)
# RUN apt-get update && apt-get install -y libgl1-mesa-glx

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY cnn_model.py .
COPY train.py .

# Generate the model during build so it persists
RUN python train.py

EXPOSE 5000

CMD ["python", "app.py"]
