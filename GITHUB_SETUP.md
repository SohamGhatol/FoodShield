# 🐙 GitHub Repository Setup Guide

**Current Status**: 
-   I have created a helper script: `github_upload.bat`
-   I have pre-filled it with your repository URL: `https://github.com/SohamGhatol/FoodShield.git`

## ⚠️ Action Required: Install Git

The automatic script cannot run because **Git is not installed** on your computer.

### Step 1: Install Git
1.  Download Git from: [git-scm.com/download/win](https://git-scm.com/download/win)
2.  Install it (default settings are fine).
3.  **Restart your computer** or fully close and reopen VS Code.

### Step 2: Run the Upload Script
Once Git is installed:
1.  Navigate to the `FoodShield` folder.
2.  Double-click **`github_upload.bat`**.
3.  The script will automatically:
    -   Initialize Git.
    -   Commit all files.
    -   Push them to your repository `https://github.com/SohamGhatol/FoodShield.git`.

---

### Alternative: Manual Commands
If you prefer to run commands manually in your terminal (after installing Git):

```bash
git init
git add .
git commit -m "Initial commit of FoodShield Enterprise Platform"
git branch -M main
git remote add origin https://github.com/SohamGhatol/FoodShield.git
git push -u origin main
```
