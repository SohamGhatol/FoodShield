import os
import shutil
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger
)
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
)
from cnn_model import create_model

# ─── Configuration ────────────────────────────────────────────────────────────
IMG_HEIGHT   = 224
IMG_WIDTH    = 224
BATCH_SIZE   = 32
EPOCHS       = 30          # EarlyStopping will cut this short when needed
LR           = 1e-4
MODEL_PATH   = 'model.h5'
BEST_PATH    = 'model_best.h5'
LOG_PATH     = 'training_log.csv'
DATASET_DIR  = 'dataset'   # Expected layout: dataset/real/ and dataset/ai/
VAL_SPLIT    = 0.2         # 20% images go to validation

# ─── Transfer-learning model (EfficientNetB0) ────────────────────────────────
def create_transfer_model():
    """
    Uses EfficientNetB0 pre-trained on ImageNet as a feature extractor.
    Adds custom classification head for binary: Real (0) vs AI-Generated (1).
    This is far more accurate than training a small CNN from scratch.
    """
    base = EfficientNetB0(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)
    )
    # Freeze base initially — we'll fine-tune after initial training
    base.trainable = False

    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(1, activation='sigmoid')(x)  # 0 = Real, 1 = AI

    model = Model(inputs=base.input, outputs=output)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LR),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc'),
                 tf.keras.metrics.Precision(name='precision'),
                 tf.keras.metrics.Recall(name='recall')]
    )
    return model, base


# ─── Data Generators ──────────────────────────────────────────────────────────
def build_generators(dataset_dir):
    """
    Builds train and validation generators with aggressive augmentation
    to make the model robust to diverse phone photography conditions.
    """
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=VAL_SPLIT,
        # Geometric augmentations
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=False,        # Food photos usually have a "top"
        # Colour augmentations — important for food across lighting
        brightness_range=[0.7, 1.3],
        channel_shift_range=30.0,
        fill_mode='nearest',
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=VAL_SPLIT,
    )

    train_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        class_mode='binary',        # real=0, ai=1 (alphabetical)
        subset='training',
        shuffle=True,
        seed=42,
    )

    val_gen = val_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation',
        shuffle=False,
        seed=42,
    )

    return train_gen, val_gen


# ─── Training ─────────────────────────────────────────────────────────────────
def train(dataset_dir):
    print("\n=== Phase 1: Training classification head (base frozen) ===")
    model, base = create_transfer_model()
    model.summary()

    train_gen, val_gen = build_generators(dataset_dir)

    print(f"\nClass indices: {train_gen.class_indices}")
    print(f"Train samples: {train_gen.n} | Val samples: {val_gen.n}\n")

    # Compute class weights to handle imbalanced datasets
    total = train_gen.n
    n_real = sum(1 for l in train_gen.labels if l == 0)
    n_ai   = total - n_real
    class_weight = {
        0: total / (2.0 * max(n_real, 1)),   # real
        1: total / (2.0 * max(n_ai,  1)),    # ai
    }
    print(f"Class weights → real: {class_weight[0]:.2f}, ai: {class_weight[1]:.2f}")

    callbacks = [
        ModelCheckpoint(BEST_PATH, monitor='val_auc', mode='max',
                        save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_auc', mode='max', patience=6,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=3,
                          min_lr=1e-7, verbose=1),
        CSVLogger(LOG_PATH, append=False),
    ]

    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        class_weight=class_weight,
        callbacks=callbacks,
        verbose=1,
    )

    # ─── Phase 2: Fine-tune top layers of EfficientNet ────────────────────
    print("\n=== Phase 2: Fine-tuning top 30 layers of EfficientNetB0 ===")
    base.trainable = True
    # Only unfreeze the top 30 layers to avoid over-fitting on small datasets
    for layer in base.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LR / 10),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc'),
                 tf.keras.metrics.Precision(name='precision'),
                 tf.keras.metrics.Recall(name='recall')]
    )

    fine_tune_callbacks = [
        ModelCheckpoint(BEST_PATH, monitor='val_auc', mode='max',
                        save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_auc', mode='max', patience=5,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=2,
                          min_lr=1e-8, verbose=1),
        CSVLogger(LOG_PATH, append=True),
    ]

    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=15,             # Fine-tuning needs fewer epochs
        class_weight=class_weight,
        callbacks=fine_tune_callbacks,
        verbose=1,
    )

    # Save final model (compatible with app.py's tf.keras.models.load_model)
    model.save(MODEL_PATH)
    print(f"\n✅ Final model saved to '{MODEL_PATH}'")
    print(f"✅ Best checkpoint saved to '{BEST_PATH}'")

    # ─── Quick evaluation report ──────────────────────────────────────────
    print("\n=== Final Evaluation on Validation Set ===")
    results = model.evaluate(val_gen, verbose=1)
    names = model.metrics_names
    print(f"\n  Loss      : {results[0]:.4f}")
    if len(results) > 1:
        print(f"  Accuracy  : {results[1]:.4f} ({results[1]*100:.1f}%)")
    if len(results) > 2:
        print(f"  AUC       : {results[2]:.4f}")
    if len(results) > 3:
        print(f"  Precision : {results[3]:.4f}")
    if len(results) > 4:
        print(f"  Recall    : {results[4]:.4f}")
    print(f"\n  Training log saved to '{LOG_PATH}'")

    return model


# ─── Placeholder fallback (no dataset yet) ────────────────────────────────────
def generate_placeholder():
    """
    When no dataset is available, saves a randomly-initialized model
    so app.py doesn't crash. The quick-fix thresholds in app.py ensure
    this placeholder won't falsely reject real images.
    """
    print("\nNo dataset found. Generating placeholder model (random weights).")
    print("⚠️  This model will NOT make accurate predictions.")
    print("    To train properly, create the following folder structure:\n")
    print("    ml_service/dataset/")
    print("    ├── real/     ← real phone photos of food (JPEG/PNG)")
    print("    └── ai/       ← AI-generated food images  (JPEG/PNG)\n")
    print("    Then run:  python train.py\n")
    model = create_model((IMG_HEIGHT, IMG_WIDTH, 3))
    model.save(MODEL_PATH)
    print(f"Placeholder model saved to '{MODEL_PATH}'")


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    tf.random.set_seed(42)
    np.random.seed(42)

    # Check for GPU
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"✅ GPU detected: {gpus}")
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    else:
        print("⚠️  No GPU detected — training will run on CPU (slower).")

    # Check dataset exists and has the required structure
    real_dir = os.path.join(DATASET_DIR, 'real')
    ai_dir   = os.path.join(DATASET_DIR, 'ai')

    has_dataset = (
        os.path.isdir(real_dir) and len(os.listdir(real_dir)) > 10 and
        os.path.isdir(ai_dir)   and len(os.listdir(ai_dir))   > 10
    )

    if has_dataset:
        print(f"✅ Dataset found:")
        print(f"   Real images : {len(os.listdir(real_dir))}")
        print(f"   AI images   : {len(os.listdir(ai_dir))}")
        train(DATASET_DIR)
    else:
        generate_placeholder()
