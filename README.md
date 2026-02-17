# 🛡️ FoodShield - Enterprise Fraud Detection Platform

**FoodShield** is an AI-powered fraud detection system designed to combat refund abuse in food delivery platforms. It combines computer vision, behavioral analytics, and metadata forensics to detect fake claims, serial abusers, and organized fraud rings.

![FoodShield Dashboard](https://via.placeholder.com/800x400.png?text=FoodShield+Dashboard+Preview)

---

## 🚀 Key Features

### 1. 📊 Intelligent Dashboard
*   **Real-time Overview**: Monitor total claims, fraud rates, and estimated savings.
*   **Smart Queues**: Claims are automatically sorted into **"Automated Decisions"** (High Confidence) and **"Manual Review"** (Ambiguous).
*   **Fraud Trends**: Visual graphs showing fraud activity over time.

### 2. 🕵️‍♂️ Advanced Claims Management
*   **AI Analysis**: Every uploaded image is analyzed for:
    *   **Generative AI Creation** (Midjourney/DALL-E detection).
    *   **Metadata Tampering** (Edited EXIF data).
    *   **Internet Duplicates** (Reverse image search simulation).
*   **Trust Score**: A unified 0-100 score indicating the legitimacy of a claim.

### 3. 🚫 Blacklist & Serial Abuser Tracking
*   **Identifies Repeat Offenders**: Users with a history of rejected claims are flagged.
*   **Compact Watchlist**: Manage high-risk users with a dedicated blacklist interface.
*   **Pattern Recognition**: Detects users creating multiple accounts on the same device.

### 4. 📈 Analytics & Reports
*   **Deep Dive Metrics**: Analyze fraud attempts by region or restaurant.
*   **Financial Impact**: Track cumulative money saved by blocking fraudulent refunds.
*   **Exportable Data**: Generate PDF/CSV reports for stakeholders.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Modern CSS (Glassmorphism, Dark Theme)
*   **Charts**: Recharts (Interactive Data Visualization)
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

### Backend
*   **Framework**: Java Spring Boot
*   **Security**: JWT Authentication, Spring Security
*   **Database**: PostgreSQL
*   **AI Engine**: Python Microservices (Integration Ready)

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Java JDK 21
*   Maven

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the dashboard at `http://localhost:5173`

### 2. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
API runs on `http://localhost:8080`

---

## 🧠 Fraud Detection Logic

FoodShield calculates a **Unified Fraud Score** based on multiple factors:

| Weight | Factor | Description |
| :--- | :--- | :--- |
| **30%** | **AI Analysis** | Is the image AI-generated or edited? |
| **25%** | **Forensics** | Does ELA analysis show tampering? |
| **20%** | **Behavior** | Does the user have a high refund rate? |
| **15%** | **Duplicates** | Has this image been used before? |
| **10%** | **Device** | Is the device ID associated with other bans? |

### Decision Thresholds
*   **Score > 85**: ✅ **Auto-Approve** (High Trust)
*   **Score < 40**: ❌ **Auto-Reject** (Likely Fraud)
*   **40 - 85**: ⚠️ **Manual Review** (Human Analyst Required)

---

## 🔮 Future Roadmap
*   **Live Video Verification**: Require video proof for high-value refunds.
*   **Graph Network Analysis**: Visualizing connections between fraudulent accounts.
*   **Real-time Alerts**: Slack/Email integration for instant fraud notifications.

---

*© 2024 FoodShield Security Systems. All Rights Reserved.*
