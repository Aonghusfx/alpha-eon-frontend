# 🔍 Backend 404 Troubleshooting Guide

## Current Issue
Getting 404 errors from your backend:
- `GET /api/orders/latest` → 404
- `POST /api/oauth/token` → 404

---

## Possible Causes & Solutions

### Option 1: Backend Routes Don't Exist Yet ✅ Most Likely
Your backend might not have these endpoints implemented.

**Check your backend code for these routes:**
```javascript
// backend/routes or backend/api
GET  /api/orders/latest
POST /api/oauth/token
POST /api/transactions/sale
GET  /api/merchant_management/v2/locations/:locationId/plans
// ... other Alphaeon proxy routes
```

**If routes don't exist, you have 2 options:**

#### A. Direct Alphaeon API Calls (Recommended for Now)
Frontend calls Alphaeon directly without backend proxy:
- Con: Exposes credentials in frontend (already happening)
- Pro: Works immediately without backend changes

#### B. Create Backend Proxy Routes (Production Recommended)
Backend proxies all Alphaeon calls:
- Pro: Keeps credentials server-side
- Pro: Better security and error handling
- Con: Requires backend development

---

### Option 2: Backend Route Structure is Different
Maybe your backend uses different paths:
```
# Instead of: /api/oauth/token
# Maybe it's:  /oauth/token (no /api prefix)
# Or:          /v1/oauth/token
# Or:          /alphaeon/oauth/token
```

**To check:** Look at your backend's route definitions or API documentation.

---

### Option 3: CORS or Auth Issues
Even if routes exist, they might be blocked:
- CORS not configured for frontend domain
- Missing authentication headers
- Backend expecting different request format

---

## 🔧 Quick Fix Options

### Fix 1: Make Orders Endpoint Optional (Already Applied)
The code now falls back to default amount if orders endpoint fails.

### Fix 2: Call Alphaeon Directly (Temporary Solution)
Update alphaeonApi.ts to call Alphaeon's API directly:

```typescript
// Change this:
const response = await fetch(`${this.baseUrl}/api/oauth/token`, {
  
// To this (Alphaeon sandbox directly):
const response = await fetch(`https://api.sandbox.alphaeon.com/oauth/token`, {
```

**Note:** This exposes credentials but works for testing.

### Fix 3: Check Backend Logs
Go to Vercel dashboard → alpha-eon-backend → Logs
Look for:
- Route not found errors
- Actual route patterns registered
- Any error messages

---

## 🎯 Recommended Next Steps

1. **Check if backend has these routes:**
   ```bash
   # Open your backend project
   # Search for "oauth" or "orders" endpoints
   ```

2. **If routes don't exist:**
   - Option A: Use frontend to call Alphaeon directly (quick fix)
   - Option B: Build backend proxy layer (proper fix)

3. **If routes exist but returning 404:**
   - Check route paths match exactly
   - Verify Vercel deployment includes routes
   - Check CORS configuration

4. **Test with curl:**
   ```bash
   curl https://alpha-eon-backend.vercel.app/api/oauth/token \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"client_id":"test","client_secret":"test"}'
   ```

---

## 📞 Need Backend Route Examples?
I can help create the backend proxy routes if you share:
- Backend framework (Express, Next.js API routes, etc.)
- Current backend structure
- Or confirm we should just call Alphaeon directly

---

## Current Workaround
The app will now:
- ✅ Use default $802 if orders endpoint fails
- ⚠️ Still fail on oauth/token if backend doesn't proxy it

**For oauth/token:**
- If backend doesn't have it, we need to either:
  1. Add it to backend, OR
  2. Call Alphaeon API directly from frontend
