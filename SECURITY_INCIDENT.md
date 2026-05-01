# 🚨 SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED

## Issue
GitGuardian detected exposed credentials in your GitHub repository.

## Exposed Credentials
- VITE_ALPHAEON_CLIENT_ID
- VITE_ALPHAEON_CLIENT_SECRET  
- VITE_ADVITAL_PUBLISHABLE_KEY

---

## IMMEDIATE ACTIONS (Do These Now)

### 1. Rotate Alphaeon Credentials ⚠️
Contact Alphaeon support immediately to:
- Revoke the exposed credentials
- Request new Client ID and Client Secret
- Update your backend AND frontend with new credentials

### 2. Remove Secrets from Git History
```bash
# Navigate to your repo
cd alpha-eon-frontend

# Remove .env from Git tracking (it's already in .gitignore now)
git rm --cached .env

# Commit the removal
git add .gitignore .env
git commit -m "chore: remove sensitive data and add .gitignore"

# Push changes
git push origin main
```

### 3. Clean Git History (Optional but Recommended)
If the credentials are in previous commits:
```bash
# Use BFG Repo Cleaner or git-filter-repo
# This rewrites Git history - coordinate with your team first!

# Option 1: Using BFG (easier)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### 4. Update Environment Variables in Vercel
Go to your Vercel dashboard:

**Frontend (alpha-eon-frontend.vercel.app)**
- Settings → Environment Variables
- Add NEW rotated credentials (never commit these):
```
VITE_ALPHAEON_CLIENT_ID=NEW_CLIENT_ID_HERE
VITE_ALPHAEON_CLIENT_SECRET=NEW_SECRET_HERE
VITE_ADVITAL_PUBLISHABLE_KEY=NEW_KEY_HERE
VITE_ALPHAEON_API_URL=https://alpha-eon-backend.vercel.app
VITE_ALPHAEON_LOCATION_ID=15470
```

**Backend (alpha-eon-backend.vercel.app)**
- Also update with NEW Alphaeon credentials

### 5. Redeploy Both Apps
```bash
# Triggers new build with updated env vars
vercel --prod
```

---

## ✅ Prevention (Already Done)
- ✅ Created .gitignore to exclude .env files
- ✅ Cleared secrets from .env (now just a template)
- ⚠️ .env.example still has placeholders (safe)

---

## 📞 Contact Points
- **Alphaeon Support**: Contact for credential rotation
- **GitGuardian**: Mark the incident as resolved after rotation
- **Team**: Inform them about the credential rotation

---

## Local Development Setup (After Rotation)
1. Copy .env.example to .env
2. Add your NEW credentials (locally only)
3. Never commit .env again (it's now in .gitignore)

```bash
cp .env.example .env
# Edit .env with real credentials
# Git will ignore it automatically
```
