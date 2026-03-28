# 🚀 How to Run FoodShield (After Downloading)

This guide explains how to set up and run the project if you have cloned it from GitHub or downloaded the ZIP file.

## 📥 Option 1: Via Git Clone (Recommended)

1.  **Open your terminal** (Command Prompt or PowerShell).
2.  **Clone the repository**:
    ```bash
    git clone https://github.com/SohamGhatol/FoodShield.git
    ```
3.  **Go into the project folder**:
    ```bash
    cd FoodShield
    ```
4.  **Run the automated setup**:
    *   Double-click the **`setup.bat`** file in the folder.
    *   *OR* run it in the terminal:
        ```bash
        .\setup.bat
        ```
    
    This script will install all dependencies and start the frontend automatically! 🎉

---

## 📦 Option 2: Download as ZIP

1.  Click **Code** -> **Download ZIP** on GitHub.
2.  **Extract** the ZIP file to a folder (e.g., `Downloads/FoodShield`).
3.  **Open that folder**.
4.  Double-click **`setup.bat`**.

---

## 🛠️ Manual Setup (If the script fails)

If `setup.bat` doesn't work for some reason, follow these manual steps:

### 1. Frontend (The User Interface)
```bash
cd frontend
npm install
npm run dev
```
*Access:* `http://localhost:5173`

### 2. Backend (The API)
*(Requires Java 21 & Maven)*
```bash
cd backend
mvn spring-boot:run
```
*Access:* `http://localhost:8080`
