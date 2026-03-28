from flask import Flask, request, jsonify
import random
import os
import numpy as np
from PIL import Image

app = Flask(__name__)

import tensorflow as tf

# Load Model
MODEL_PATH = 'model.h5'
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Hyperscale CNN Model loaded successfully.")
    else:
        print("Warning: Model file not found. Inference will fail.")
except Exception as e:
    print(f"Failed to load model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    # Check if a file was uploaded
    if 'image' in request.files:
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        # For uploaded files, we could process bytes directly
        # But for now, we'll stick to the simulation
        
    # Check if a filepath was provided (Shared Volume Mode)
    elif request.is_json and 'filepath' in request.json:
        filepath = request.json['filepath']
        # Verification: in container, path might be relative or absolute
        # backend sends "uploads/uuid_filename.jpg"
        # we are in /app, so "uploads/..." is correect
        if not os.path.exists(filepath):
             return jsonify({'error': 'File not found at path: ' + filepath}), 404
    else:
        return jsonify({'error': 'No image or filepath provided'}), 400

    # Here we would process the image:
    # 1. Read image bytes
    # 2. Preprocess for model (resize, normalize)
    # 3. prediction = model.predict(processed_image)
    
    # DEEP LEARNING INFERENCE
    try:
        # 1. Load Image & Preprocess
        # For filepath (shared volume)
        if request.is_json and 'filepath' in request.json:
            img_path = filepath
        # For direct upload
        else:
            # Save temporarily to process
            img_path = "temp_img.jpg"
            file.save(img_path)
            
        img = Image.open(img_path).convert('RGB')
        
        # --- PHASE 1: Food Verification (MobileNetV2) ---
        img_resized_mobil = img.resize((224, 224))
        img_array_mobil = np.array(img_resized_mobil)
        img_array_mobil = tf.keras.applications.mobilenet_v2.preprocess_input(img_array_mobil)
        img_array_mobil = np.expand_dims(img_array_mobil, axis=0)
        
        # Load MobileNetV2 (lazy load or global)
        global mobilenet
        if 'mobilenet' not in globals():
            print("Loading MobileNetV2...")
            mobilenet = tf.keras.applications.MobileNetV2(weights='imagenet')
            
        preds = mobilenet.predict(img_array_mobil)
        decoded = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=5)[0]
        
        # Check for food synonyms in top 5 specific predictions
        # This list can be expanded. ImageNet has detailed labels.
        food_keywords = [
            # Standard western food
            'food', 'dish', 'fruit', 'vegetable', 'meat', 'bakery', 'bread', 'cake', 'burger',
            'pizza', 'sandwich', 'soup', 'curry', 'roast', 'steak', 'pasta', 'noodle', 'rice',
            'plate', 'bowl', 'dining', 'eating', 'beverage', 'drink', 'coffee', 'tea', 'wine',
            'beer', 'juice', 'sauce', 'condiment', 'snack', 'dessert', 'chocolate', 'ice_cream',
            'orange', 'lemon', 'banana', 'apple', 'grape', 'strawberry', 'pineapple', 'fig',
            'pomegranate', 'corn', 'cucumber', 'mushroom', 'broccoli', 'cabbage', 'carrot',
            'potato', 'tomato', 'onion', 'garlic', 'pepper', 'egg', 'cheese', 'butter', 'milk',
            'yogurt', 'cream', 'fish', 'seafood', 'crab', 'lobster', 'shrimp', 'chicken', 'duck',
            'turkey', 'pork', 'beef', 'lamb', 'sausage', 'ham', 'bacon', 'hotdog', 'hamburger',
            'cheeseburger', 'taco', 'burrito', 'sushi', 'sashimi', 'bagel', 'biscuit', 'cookie',
            'muffin', 'pancake', 'waffle', 'cereal', 'oatmeal', 'salad', 'stew',
            'guacamole', 'hummus', 'salsa', 'dip', 'chips', 'fries', 'popcorn', 'pretzel', 'nut',
            'seed', 'candy', 'gum', 'wok', 'pot', 'pan', 'spoon', 'fork',
            # Indian / South Asian food (ImageNet uses generic labels — map container/prep words)
            'biryani', 'roti', 'dosa', 'idli', 'vada', 'samosa', 'dal', 'sabzi', 'paneer',
            'tikka', 'masala', 'chaat', 'raita', 'khichdi', 'upma', 'poha', 'halwa', 'puri',
            'paratha', 'chapati', 'naan', 'kulcha', 'tandoori', 'korma', 'vindaloo', 'dhokla',
            'thali', 'lassi', 'chutney', 'pickle', 'achaar', 'pakora', 'bhaji', 'kofta',
            'pulao', 'kheer', 'ladoo', 'barfi', 'gulab', 'jalebi', 'payasam',
            # Asian / Chinese / Japanese / Thai
            'dim_sum', 'dumpling', 'spring_roll', 'fried_rice', 'congee', 'miso', 'ramen',
            'udon', 'tempura', 'teriyaki', 'pad_thai', 'pho', 'banh', 'bibimbap', 'kimchi',
            'satay', 'laksa', 'rendang', 'tofu', 'mochi', 'takoyaki',
            # Catch-all ImageNet container/plate words that imply food context
            'potpie', 'carbonara', 'consomme', 'hotpot', 'pretzel', 'trifle', 'custard',
            'lemon', 'lime', 'mango', 'papaya', 'plum', 'pear', 'peach', 'apricot',
            'acorn', 'artichoke', 'zucchini', 'eggplant', 'radish', 'turnip', 'beet',
            'asparagus', 'spinach', 'kale', 'lettuce', 'celery', 'leek', 'fennel',
        ]

        is_food = False
        top_label = decoded[0][1]
        food_confidence = 0.0

        print("MobileNet Prediction:", top_label)

        # Check all top-5 predictions — pass if ANY match a food keyword
        for i, (imagenet_id, label, score) in enumerate(decoded):
            print(f"Prediction {i}: {label} ({score:.4f})")
            if any(k in label.lower() for k in food_keywords):
                is_food = True
                food_confidence = float(score)
                break

        # Soft fallback: if the top prediction confidence is very low (<0.15),
        # MobileNetV2 is uncertain — treat as food to avoid false rejections
        if not is_food and decoded[0][2] < 0.15:
            is_food = True
            print(f"Low top-confidence ({decoded[0][2]:.4f}) — treating as food (uncertain image).")
        
        # If NOT food, reject immediately
        if not is_food:
            return jsonify({
                'is_food': False,
                'is_ai_generated': False, # Not relevant
                'confidence': 1.0, # High confidence it's invalid
                'message': f"REJECTED: Image appears to be '{top_label}', not food."
            })

        # --- PHASE 2: AI Forgery Detection (Custom CNN) ---
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized) / 255.0 # Normalize
        img_array = np.expand_dims(img_array, axis=0) # Add batch dimension

        if model:
            prediction = model.predict(img_array)
            probability = float(prediction[0][0])  # 0.0=Real, 1.0=AI

            # Fix 2: Raise threshold to 0.65 (was 0.5) to reduce false positives
            # Fix 3: Uncertainty band — if model is not confident (0.35–0.65),
            #        mark as uncertain so the Java layer defaults to REVIEW not REJECTED
            UNCERTAIN_LOW  = 0.35
            UNCERTAIN_HIGH = 0.65

            if UNCERTAIN_LOW <= probability <= UNCERTAIN_HIGH:
                # Model is not confident — treat as real, flag for human review
                is_ai_generated = False
                confidence = 0.5  # Signal uncertainty
                message = "Model uncertain — flagged for manual review"
            else:
                is_ai_generated = probability > UNCERTAIN_HIGH
                confidence = probability if is_ai_generated else (1.0 - probability)
                message = "Deep Learning Analysis Complete"
        else:
            # Fallback if model missing
            is_ai_generated = False
            confidence = 0.0
            message = "Model not loaded — defaulting to safe"

        return jsonify({
            'is_food': True,
            'is_ai_generated': is_ai_generated,
            'confidence': round(confidence, 2),
            'metrics': {'raw_probability': probability},
            'message': message
        })

    except Exception as e:
        print(f"Error processing image: {e}")
        # Fallback to Heuristic if DL fails
        return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500

if __name__ == '__main__':
    print("Starting ML Service on port 5000...")
    app.run(host='0.0.0.0', port=5000)
