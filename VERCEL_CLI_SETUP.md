# 🚀 Set Vercel Environment Variables from Terminal

## ⚡ Quick Setup Script

Copy and paste these commands in your terminal to set up environment variables for BOTH projects:

---

## 1️⃣ FRONTEND Environment Variables

```powershell
# Navigate to frontend
cd alpha-eon-frontend

# Set frontend environment variables
vercel env add VITE_ALPHAEON_API_URL production
# When prompted, paste: https://alpha-eon-backend.vercel.app

vercel env add VITE_ALPHAEON_CLIENT_ID production
# When prompted, paste: faB1X0qx8UgquO9hFlnmBP76orJRy7y3

vercel env add VITE_ALPHAEON_CLIENT_SECRET production
# When prompted, paste: d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph

vercel env add VITE_ALPHAEON_LOCATION_ID production
# When prompted, paste: 15470

vercel env add VITE_ALPHAEON_AUDIENCE production
# When prompted, paste: https://api.alphaeon.com/

vercel env add VITE_ALPHAEON_IFRAME_URL production
# When prompted, paste: https://iframe.go.sandbox.alphaeontest.com

vercel env add VITE_ADVITAL_ALLOWED_ORIGIN production
# When prompted, paste: https://adv-dev.vercel.app

vercel env add VITE_ADVITAL_PORTAL_BASE_URL production
# When prompted, paste: https://adv-dev.vercel.app

vercel env add VITE_ADVITAL_PUBLISHABLE_KEY production
# When prompted, paste: jYjfEW-aZG66e-w8a28d-Z6F5zB

vercel env add VITE_ADVITAL_LOCATION_ID production
# When prompted, paste: test123

# Redeploy frontend
vercel --prod
```

---

## 2️⃣ BACKEND Environment Variables

```powershell
# Navigate to backend (adjust path to your backend folder)
cd ../alpha-eon-backend

# Set backend environment variables
vercel env add CLIENT_ID production
# When prompted, paste: faB1X0qx8UgquO9hFlnmBP76orJRy7y3

vercel env add CLIENT_SECRET production
# When prompted, paste: d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph

vercel env add ALPHAEON_AUTH_URL production
# When prompted, paste: https://auth.sandbox.alphaeon.com

vercel env add ALPHAEON_API_URL production
# When prompted, paste: https://api.sandbox.alphaeon.com

vercel env add ALPHAEON_AUDIENCE production
# When prompted, paste: https://api.alphaeon.com

vercel env add ALPHAEON_MERCHANT_ID production
# When prompted, paste: 25311

vercel env add NODE_ENV production
# When prompted, paste: production

# Redeploy backend
vercel --prod
```

---

## ⚡ Alternative: Bulk Import (Faster!)

### For Frontend:
1. Create a file `frontend-env.txt` with:
```
VITE_ALPHAEON_API_URL="https://alpha-eon-backend.vercel.app"
VITE_ALPHAEON_CLIENT_ID="faB1X0qx8UgquO9hFlnmBP76orJRy7y3"
VITE_ALPHAEON_CLIENT_SECRET="d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph"
VITE_ALPHAEON_LOCATION_ID="15470"
VITE_ALPHAEON_AUDIENCE="https://api.alphaeon.com/"
VITE_ALPHAEON_IFRAME_URL="https://iframe.go.sandbox.alphaeontest.com"
VITE_ADVITAL_ALLOWED_ORIGIN="https://adv-dev.vercel.app"
VITE_ADVITAL_PORTAL_BASE_URL="https://adv-dev.vercel.app"
VITE_ADVITAL_PUBLISHABLE_KEY="jYjfEW-aZG66e-w8a28d-Z6F5zB"
VITE_ADVITAL_LOCATION_ID="test123"
```

2. Run:
```powershell
cd alpha-eon-frontend
vercel env pull .env.production
# Edit .env.production with values above
vercel env push .env.production production
```

### For Backend:
1. Create a file `backend-env.txt` with:
```
CLIENT_ID="faB1X0qx8UgquO9hFlnmBP76orJRy7y3"
CLIENT_SECRET="d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph"
ALPHAEON_AUTH_URL="https://auth.sandbox.alphaeon.com"
ALPHAEON_API_URL="https://api.sandbox.alphaeon.com"
ALPHAEON_AUDIENCE="https://api.alphaeon.com"
ALPHAEON_MERCHANT_ID="25311"
NODE_ENV="production"
```

2. Run:
```powershell
cd ../alpha-eon-backend
vercel env pull .env.production
# Edit .env.production with values above
vercel env push .env.production production
```

---

## 🎯 Easiest Method: Vercel Dashboard

If CLI is acting up, use the dashboard:
1. Go to: https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Copy-paste values from the lists above
4. Save and redeploy

---

## ✅ After Setup

Test your deployment:
```powershell
# Check if variables are set
vercel env ls

# Test the endpoints
curl https://alpha-eon-backend.vercel.app/api/alphaeon
curl https://alpha-eon-frontend.vercel.app
```

---

## 📝 Notes

- Use `production` for live deployment
- Add same variables to `preview` and `development` if needed
- After adding variables, redeploy with `vercel --prod`
- Check deployment logs: `vercel logs <deployment-url>`
