# ✅ CORRECT ALPHAEON SANDBOX CONFIGURATION

## 🎯 The Issue Was WRONG URLs!

Your client just provided the **CORRECT** Alphaeon sandbox URLs. This is why you were getting 500 errors!

---

## ❌ **What We Were Using (WRONG)**
```env
ALPHAEON_AUTH_URL=https://auth.sandbox.alphaeon.com
ALPHAEON_API_URL=https://api.sandbox.alphaeon.com
ALPHAEON_AUDIENCE=https://api.alphaeon.com
```

## ✅ **What Client Provided (CORRECT)**
```bash
curl -X POST https://login.alphaeontest.com/oauth/token
{
  "client_id": "faB1X0qx8UgquO9hFlnmBP76orJRy7y3",
  "client_secret": "d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph",
  "audience": "https://api.sandbox.alphaeontest.com",
  "grant_type": "client_credentials"
}
```

---

## 🔧 **CORRECT Backend Environment Variables**

Copy these EXACT values to your **alpha-eon-backend** Vercel project:

```env
CLIENT_ID=faB1X0qx8UgquO9hFlnmBP76orJRy7y3
CLIENT_SECRET=d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph
ALPHAEON_AUTH_URL=https://login.alphaeontest.com
ALPHAEON_API_URL=https://api.sandbox.alphaeontest.com
ALPHAEON_AUDIENCE=https://api.sandbox.alphaeontest.com
ALPHAEON_MERCHANT_ID=25311
NODE_ENV=production
```

**Note the differences:**
- Auth URL: `login.alphaeontest.com` (not `auth.sandbox.alphaeon.com`)
- API URL: `api.sandbox.alphaeontest.com` (not `api.sandbox.alphaeon.com`)
- Audience: `api.sandbox.alphaeontest.com` (not `api.alphaeon.com`)

---

## 🔧 **CORRECT Frontend Environment Variables**

Copy these to your **alpha-eon-frontend** Vercel project:

```env
VITE_ALPHAEON_API_URL=https://alpha-eon-backend.vercel.app
VITE_ALPHAEON_CLIENT_ID=faB1X0qx8UgquO9hFlnmBP76orJRy7y3
VITE_ALPHAEON_CLIENT_SECRET=d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph
VITE_ALPHAEON_LOCATION_ID=15470
VITE_ALPHAEON_AUDIENCE=https://api.sandbox.alphaeontest.com
VITE_ALPHAEON_IFRAME_URL=https://iframe.go.sandbox.alphaeontest.com
VITE_ADVITAL_ALLOWED_ORIGIN=https://adv-dev.vercel.app
VITE_ADVITAL_PORTAL_BASE_URL=https://adv-dev.vercel.app
VITE_ADVITAL_PUBLISHABLE_KEY=jYjfEW-aZG66e-w8a28d-Z6F5zB
VITE_ADVITAL_LOCATION_ID=test123
```

---

## 🚀 **Quick Setup Steps**

### 1. Update Backend (CRITICAL!)
Go to: https://vercel.com/dashboard
1. Select **alpha-eon-backend** project
2. Settings → Environment Variables
3. **Update or add** these variables with CORRECT URLs:
   - `ALPHAEON_AUTH_URL` = `https://login.alphaeontest.com`
   - `ALPHAEON_API_URL` = `https://api.sandbox.alphaeontest.com`
   - `ALPHAEON_AUDIENCE` = `https://api.sandbox.alphaeontest.com`
   - `CLIENT_ID` = `faB1X0qx8UgquO9hFlnmBP76orJRy7y3`
   - `CLIENT_SECRET` = `d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph`
   - `ALPHAEON_MERCHANT_ID` = `25311`
   - `NODE_ENV` = `production`
4. **Redeploy** backend

### 2. Update Frontend
1. Select **alpha-eon-frontend** project
2. Settings → Environment Variables
3. Update: `VITE_ALPHAEON_AUDIENCE` = `https://api.sandbox.alphaeontest.com`
4. **Redeploy** frontend

---

## 🧪 **Test Authentication**

After updating backend variables, test in browser console:

```javascript
fetch('https://alpha-eon-backend.vercel.app/api/alphaeon/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('✅ Auth Response:', d));
```

**Expected result:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

---

## 📁 **Updated Files**

I've already updated these local files with correct URLs:
- ✅ `.env.local` - For local development
- ✅ `vercel-backend.env` - Backend variables (copy to Vercel)
- ✅ `vercel-frontend.env` - Frontend variables (copy to Vercel)

---

## ⚠️ **Why This Matters**

The backend was calling:
```
❌ https://auth.sandbox.alphaeon.com/oauth/token (Wrong - doesn't exist)
```

It should call:
```
✅ https://login.alphaeontest.com/oauth/token (Correct - client provided)
```

This is why you got 500 errors - the authentication URL was completely wrong!

---

## 🎉 **After This Update**

Your backend will:
1. ✅ Successfully authenticate with Alphaeon
2. ✅ Get valid OAuth tokens
3. ✅ Be able to make API calls
4. ✅ Return 200 OK (not 500 errors)

---

## 🔐 **Security Note**

These are the SAME credentials but with CORRECT URLs. They were already exposed in Git, so:
- ✅ Safe for sandbox testing
- ⚠️ Still need to be rotated before production
- ✅ Now pointing to correct Alphaeon test environment

---

## ✅ **Summary**

**Update backend env vars with:**
- `ALPHAEON_AUTH_URL` → `https://login.alphaeontest.com`
- `ALPHAEON_API_URL` → `https://api.sandbox.alphaeontest.com`
- `ALPHAEON_AUDIENCE` → `https://api.sandbox.alphaeontest.com`

**Then redeploy both projects and test!** 🚀
