# ⚡ QUICK FIX - Backend Environment Variables

## 🎯 The Problem
Your backend at `https://alpha-eon-backend.vercel.app` is missing environment variables, causing the 500 error.

---

## ✅ SOLUTION - Add These to Vercel

### Go to Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Click: **alpha-eon-backend** project
3. Click: **Settings** → **Environment Variables**
4. Add each variable below:

---

## 📋 Copy-Paste These Values

### For SANDBOX Testing (Recommended):
```
Variable Name: CLIENT_ID
Value: faB1X0qx8UgquO9hFlnmBP76orJRy7y3
Environment: Production, Preview, Development

Variable Name: CLIENT_SECRET  
Value: d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph
Environment: Production, Preview, Development

Variable Name: ALPHAEON_AUTH_URL
Value: https://auth.sandbox.alphaeon.com
Environment: Production, Preview, Development

Variable Name: ALPHAEON_API_URL
Value: https://api.sandbox.alphaeon.com
Environment: Production, Preview, Development

Variable Name: ALPHAEON_AUDIENCE
Value: https://api.alphaeon.com
Environment: Production, Preview, Development

Variable Name: ALPHAEON_MERCHANT_ID
Value: 25311
Environment: Production, Preview, Development

Variable Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

---

## 🚀 After Adding Variables

### Option 1: Redeploy in Dashboard
1. Go to **Deployments** tab
2. Click latest deployment
3. Click ⋯ (three dots)
4. Click **Redeploy**
5. Wait 1-2 minutes

### Option 2: Git Push
```bash
# Just push any change to trigger redeploy
git commit --allow-empty -m "chore: trigger redeploy with env vars"
git push origin main
```

---

## 🧪 Test After Deploy

Visit: https://alpha-eon-frontend.vercel.app/

Click Alphaeon button. You should see:
- ✅ No more 500 error
- ✅ Console: "Alphaeon authentication successful!"
- ✅ Order amount loads

---

## ⚠️ Important Notes

1. **Select ALL Environments** when adding each variable:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

2. **These are SANDBOX credentials** - safe for testing

3. **Before production:** Get new credentials from Alphaeon

---

## 📸 Screenshots Guide

### Step 1: Find Environment Variables
![Vercel Settings](https://via.placeholder.com/800x100?text=Settings+→+Environment+Variables)

### Step 2: Add Variable
![Add Variable](https://via.placeholder.com/800x200?text=Name+|+Value+|+Environments)

### Step 3: Save & Redeploy
![Redeploy](https://via.placeholder.com/800x100?text=Deployments+→+Redeploy)

---

## 🆘 Still Not Working?

1. **Verify all 7 variables are added**
2. **Check all are set for "Production" environment**
3. **Confirm redeploy completed** (check Deployments tab)
4. **Check backend logs** in Vercel for new errors
5. **Clear browser cache** and try again

---

**This should fix the 500 error!** 🎉

Let me know if you need help with any step.
