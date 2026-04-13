# 🍽️ FoodShield — AI-Powered Food Fraud Detection Platform

FoodShield is a full-stack web application that uses machine learning to detect fraudulent food delivery refund claims. It analyzes uploaded food images for AI generation artifacts, verifies food content, assigns risk scores, and flags suspicious claims for review.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   React Frontend│────▶│  Spring Boot API  │────▶│  Python ML Service│
│   (Vite, port   │     │  (Java, port 8080)│     │  (Flask, port 5000│
│    5173)        │     │                   │     │                   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                                 │                          │
                         ┌───────▼──────┐         ┌────────▼────────┐
                         │  PostgreSQL   │         │  EfficientNetB0  │
                         │  (port 5432) │         │  + MobileNetV2   │
                         └──────────────┘         └─────────────────┘
```

### Services
| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| `frontend` | React + Vite | 5173 | Admin dashboard UI |
| `backend` | Spring Boot 3 + Java 17 | 8080 | REST API, JWT auth, fraud engine |
| `ml-service` | Python 3.9, Flask, TensorFlow | 5000 | Image analysis (EfficientNetB0) |
| `db` | PostgreSQL 15 | 5432 | Persistent data store |

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose)
- [Node.js 18+](https://nodejs.org/) (for frontend dev mode only)
- [Python 3.9+](https://www.python.org/) (for ML training only)

### 1. Clone the Repository
```bash
git clone https://github.com/SohamGhatol/FoodShield.git
cd FoodShield
```

### 2. Start All Services
```bash
docker-compose up --build -d
```

This starts all 4 services. Wait about 60 seconds for the backend and ML service to fully initialize.

### 3. Access the Application
| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend (Landing page) |
| http://localhost:5173/dashboard | Admin Dashboard |
| http://localhost:8080/api/dashboard/stats | Backend Health Check |
| http://localhost:5000/health | ML Service Health |

---

## 🔐 Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Admin |

> The admin account is auto-created on first login if it doesn't exist in the database.

---

## 📋 Features

### ✅ Claims Management
- **Submit Claims**: Upload multiple food photos with restaurant name, claimant name, and amount
- **AI Analysis**: Automatic image analysis on submission (food verification + AI detection)
- **Filter & Sort**: Filter by status (ALL/HIGH_RISK/REVIEW/SAFE/REJECTED), risk score range; sort by date, risk score, or status priority
- **Export CSV**: Download all visible claims as a spreadsheet
- **Approve/Reject**: Context-aware one-click status updates that are dynamically restricted to valid active states (e.g. 'REVIEW' or 'ANALYZING')
- **Claim Detail View**: Full breakdown of AI score, metadata score, behavioral score, and explanation with unified multi-image preview support

### 🤖 ML Fraud Engine
- **Two-model pipeline**:
  - `MobileNetV2` (ImageNet) — checks if it's actually food (1000-class classifier)
  - `EfficientNetB0` (trained) — detects AI-generated vs real photos
- **Duplicate Image Detection (pHash)**: Backend perceptual hashing computes and checks for reused or highly similar past images
- **Food keyword matching**: 80+ food terms including Indian/Asian cuisines
- **Uncertainty band**: Confidence 0.35–0.65 → routes to Manual Review instead of auto-reject
- **Weighted risk score**: `0.6*AI + 0.2*Metadata + 0.2*Behavioral`
- **Blacklist check**: Instant rejection for blacklisted users

### 📊 Dashboard & Reports
- Real-time statistics: Total Claims, Fraud Detected, Pending Review, Estimated Savings
- Manual Review Queue vs Automated Decisions split view
- Charts: Fraud vs Legitimate trends (by month), Cumulative Savings
- Top High-Risk Restaurants table

### ⚙️ Settings
- Configurable fraud detection thresholds (auto-reject score, manual review range)
- Data retention period
- Email/Slack alert toggles (stored in DB)

### 🚫 Blacklist
- Add users to a blacklist with a reason
- All future claims from blacklisted users are auto-rejected with risk score 100

### 🛡️ Security & Role-Based Access Control (RBAC)
- **Role-Based Workflows**: Core application views and administrative actions (approve/reject/analyze) are dynamically protected and visible strictly based on authenticated roles.
- **Vulnerability Patches**: Protection against Insecure Direct Object References (IDOR) to control data leakage and stringent privilege escalation prevention to safeguard roles and user models.

### 📜 Audit Logs
- **Comprehensive Auditing**: A unified UI and backend service backing an extensive audit log to track system actions, configurations, security interventions, claim status updates, and duplicate image events.
- **Export & Search**: Search logs by staff/user name, filter by action types, and export CSVs.

---

## 🧠 ML Model Details

### Model Architecture
- **Base**: `EfficientNetB0` pre-trained on ImageNet
- **Training**: Two-phase transfer learning
  - Phase 1: Frozen base, train classification head (30 epochs, early stopping on AUC)
  - Phase 2: Unfreeze top 30 layers, fine-tune at LR/10 (15 epochs)
- **Augmentation**: Random rotation, brightness, zoom, horizontal flip
- **Output**: Binary sigmoid (0 = Real, 1 = AI-generated)

### Dataset
- **Real images**: 400 food photos from [Open Food Facts](https://world.openfoodfacts.org/) CDN
- **AI images**: 400 fake images from [CIFAKE dataset](https://huggingface.co/datasets/dragonintelligence/CIFAKE-image-dataset) (Hugging Face)

### Retrain the Model
```bash
# From the FoodShield/ml_service directory on the HOST (not in Docker)
pip install tensorflow keras pillow datasets huggingface_hub scipy

# Download dataset (idempotent — skips already-downloaded files)
python prepare_dataset.py --real-count 1000 --ai-count 1000

# Train
python train.py

# Rebuild the Docker image to use the new model
cd ..
docker-compose up --build -d ml-service
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, receive JWT token |
| POST | `/api/auth/register` | Register a new user |

### Claims
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/claims` | ✅ | Submit a new claim with image |
| GET | `/api/claims` | Public | List all claims |
| GET | `/api/claims/{id}` | Public | Get claim details + fraud analysis |
| PUT | `/api/claims/{id}/status` | ✅ | Update claim status |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get aggregate statistics |
| GET | `/api/reports/monthly` | Monthly fraud/legitimate trends |

### Settings & Blacklist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/settings` | Read/update system config |
| GET/POST | `/api/blacklist` | View/add blacklisted users |
| DELETE | `/api/blacklist/{id}` | Remove from blacklist |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images/{filename}` | Serve uploaded claim images |

---

## ⚙️ Docker Configuration

### docker-compose.yml Summary
```yaml
services:
  db:          PostgreSQL 15, port 5432
  backend:     Spring Boot, port 8080, depends on db
  ml-service:  Flask + TensorFlow, port 5000, shares /uploads volume with backend
  frontend:    React/Vite dev server, port 5173, proxies /api → backend:8080
```

### Volume Mounts
- `ml-service` and `backend` share a Docker volume at `/uploads` — claim images are written by the backend and read by the ML service via file path.

---

## 🛠️ Development

### Frontend (Hot Reload)
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Backend (Local)
```bash
# Requires PostgreSQL running locally on port 5432
cd backend
./mvnw spring-boot:run
```

### ML Service (Local)
```bash
cd ml_service
pip install flask tensorflow pillow
python app.py   # http://localhost:5000
```

---

## 🐛 Known Limitations & Future Improvements

| Area | Current State | Future |
|------|---------------|--------|
| CIFAKE training data | Generic AI images, not food-specific | Train on AI-generated food images (Stable Diffusion) |
| Metadata analysis | Random score (mock) | Real EXIF parsing with `piexif` |
| User history | Hardcoded placeholder in UI | Connect to real historical claims DB query |
| Auth scope | Most endpoints public for demo | Enforce JWT auth on all PUT/POST in production |
| ML model accuracy | ~70-80% (small dataset) | Improve with 5000+ food-specific examples |
| ELA Analysis | UI toggle exists, backend not wired | Implement Error Level Analysis with Pillow |

---

## 📁 Project Structure

```
FoodShield/
├── backend/                        # Spring Boot API
│   └── src/main/java/com/foodshield/backend/
│       ├── controller/             # REST endpoints
│       ├── service/                # Business logic (FraudEngineService, MLServiceClient...)
│       ├── model/                  # JPA entities (Claim, FraudAnalysis, User...)
│       ├── repository/             # Spring Data JPA repos
│       ├── config/                 # Security, CORS config
│       └── util/                   # JWT utilities
├── frontend/                       # React + Vite
│   └── src/
│       ├── pages/                  # Dashboard, ClaimsList, ClaimDetail, Reports, Settings...
│       ├── components/             # StatCard, RecentClaimsTable, SubmitClaimModal...
│       └── services/               # api.js (Axios instance with auth interceptors)
├── ml_service/                     # Python Flask ML service
│   ├── app.py                      # Flask API (/predict, /health)
│   ├── train.py                    # EfficientNetB0 training pipeline
│   ├── prepare_dataset.py          # Dataset downloader (Open Food Facts + CIFAKE)
│   ├── cnn_model.py                # Fallback CNN architecture
│   ├── model.h5                    # Trained model (32MB, gitignored)
│   └── dataset/                    # Training images (gitignored)
│       ├── real/                   # 400+ real food photos
│       └── ai/                     # 400+ AI-generated images
└── docker-compose.yml              # Full stack orchestration
```

---

## 🔒 Security Notes

- JWT tokens expire after 24 hours; auto-redirect to /login on 401
- Passwords hashed with BCrypt
- CORS configured to allow only `http://localhost:5173`
- File uploads validated by the ML service (must be detectable as food)
- Blacklist check happens before any ML analysis (instant rejection)
- State-based logic ensures claims in end-states cannot be manipulated without explicit audit logging and proper RBAC clearance

> ⚠️ **For production use**: Change the JWT secret in `application.properties`, disable admin auto-creation in `AuthService.java`, restrict CORS origins, and enforce strict HTTPS and role requirements on write endpoints.

---

## 📝 License

This project is built for educational/demonstration purposes.
