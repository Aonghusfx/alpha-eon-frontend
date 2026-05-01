# 🔴 Backend 500 Error - Authentication Failed

## Current Status
✅ Route found (404 fixed!)
❌ Authentication failing (500 error)

---

## Error Details
```
POST https://alpha-eon-backend.vercel.app/api/alphaeon/oauth/token
Status: 500 Internal Server Error
Response: {"error": "Authentication request failed"}
```

---

## 🔍 Root Cause Analysis

The backend is trying to authenticate with Alphaeon's OAuth service but failing. This happens when:

### 1. **Missing Environment Variables in Vercel** ⚠️ Most Likely
Your backend needs these environment variables set in Vercel:

```env
ALPHAEON_AUTH_URL=https://auth.alphaeon.com
ALPHAEON_AUDIENCE=https://api.alphaeon.com
ALPHAEON_API_URL=https://api.alphaeon.com
CLIENT_ID=your_alphaeon_client_id
CLIENT_SECRET=your_alphaeon_client_secret
ALPHAEON_MERCHANT_ID=25311
```

**Check:** Go to Vercel Dashboard → alpha-eon-backend → Settings → Environment Variables

### 2. **Incorrect Credentials**
The credentials might be:
- For sandbox but URL points to production (or vice versa)
- Expired or revoked
- Not matching the environment

### 3. **Alphaeon API URL Wrong**
Backend might be calling wrong Alphaeon endpoint:
- Sandbox: `https://api.sandbox.alphaeon.com`
- Production: `https://api.alphaeon.com`

---

## 🔧 How to Fix

### Step 1: Check Vercel Backend Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select: **alpha-eon-backend** project
3. Go to: **Settings** → **Environment Variables**
4. Verify these exist:

```env
# Required for Alphaeon Authentication
CLIENT_ID=faB1X0qx8UgquO9hFlnmBP76orJRy7y3
CLIENT_SECRET=d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph
ALPHAEON_AUTH_URL=https://auth.sandbox.alphaeon.com
ALPHAEON_API_URL=https://api.sandbox.alphaeon.com
ALPHAEON_AUDIENCE=https://api.alphaeon.com
ALPHAEON_MERCHANT_ID=25311
```

**If they're missing:** Add them and redeploy.

---

### Step 2: Check Backend Logs

1. Go to Vercel Dashboard → alpha-eon-backend → **Logs**
2. Look for the OAuth request error details
3. Check what URL it's trying to call
4. Check for error messages like:
   - "Missing CLIENT_ID"
   - "Unauthorized"
   - "Invalid credentials"

---

### Step 3: Verify Sandbox vs Production URLs

**For Sandbox (Testing):**
```env
ALPHAEON_AUTH_URL=https://auth.sandbox.alphaeon.com
ALPHAEON_API_URL=https://api.sandbox.alphaeon.com
```

**For Production:**
```env
ALPHAEON_AUTH_URL=https://auth.alphaeon.com
ALPHAEON_API_URL=https://api.alphaeon.com
```

Make sure all three match the same environment!

---

## 🧪 Quick Test - Bypass Backend (Temporary)

To verify if it's a backend issue, temporarily test calling Alphaeon directly from frontend:

**Test directly in browser console:**
```javascript
// Test Alphaeon OAuth directly
fetch('https://api.sandbox.alphaeon.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'faB1X0qx8UgquO9hFlnmBP76orJRy7y3',
    client_secret: 'd-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph',
    audience: 'https://api.alphaeon.com',
    grant_type: 'client_credentials'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Alphaeon OAuth works:', d))
.catch(e => console.error('❌ Alphaeon OAuth failed:', e));
```

- **If this works:** Backend configuration is wrong
- **If this fails:** Credentials are invalid

---

## 📋 Backend Environment Variables Checklist

Copy this and check your backend's Vercel environment variables:

```
□ CLIENT_ID (Alphaeon OAuth client ID)
□ CLIENT_SECRET (Alphaeon OAuth client secret)
□ ALPHAEON_AUTH_URL (OAuth token endpoint)
□ ALPHAEON_API_URL (Alphaeon API base URL)
□ ALPHAEON_AUDIENCE (OAuth audience/scope)
□ ALPHAEON_MERCHANT_ID (Your merchant ID)
□ NODE_ENV (development/production)
```

**All must be set for Production, Preview, and Development environments in Vercel!**

---

## 🚀 After Setting Variables

1. **Trigger Redeploy:**
   - Vercel Dashboard → Deployments → latest → "Redeploy"
   - OR push a new commit to trigger auto-deploy

2. **Wait 1-2 minutes** for deployment to complete

3. **Test again** at: https://alpha-eon-frontend.vercel.app/

---

## 🔍 Backend Code Reference

From your backend analysis, the OAuth token request is in:
- **File:** `src/controllers/alphaEon.controller.ts`
- **Function:** `createAuthToken`

It requires these environment variables:
```typescript
process.env.ALPHAEON_AUTH_URL    // OAuth endpoint
process.env.ALPHAEON_AUDIENCE    // OAuth audience
process.env.CLIENT_ID            // Your client ID
process.env.CLIENT_SECRET        // Your client secret
```

---

## 💡 Most Common Issue

**The backend environment variables weren't set!**

When you deployed to Vercel, it doesn't automatically know your `.env` values. You must:
1. Manually add them in Vercel Dashboard
2. OR use Vercel CLI: `vercel env add`

---

## 📞 If Still Not Working

1. **Check Backend Logs** for exact error
2. **Verify credentials** are for sandbox (not production)
3. **Contact Alphaeon** if credentials are expired
4. **Share backend logs** so I can see the specific error

---

## ✅ Success Indicators

Once fixed, you should see:
- Status: **200 OK** (not 500)
- Response: `{"access_token":"...","expires_in":3600,"token_type":"Bearer"}`
- Frontend console: `✅ Alphaeon authentication successful!`

---

**Next Step:** Check your backend's Vercel environment variables. That's almost certainly the issue!
