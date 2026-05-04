# 🎯 COMPLETE FIX - Location ID 15470 → 6594

## The Issue
Your deployed frontend is still calling with location ID 15470:
```
GET /api/alphaeon/merchant_management/v2/locations/15470/plans
```

## ✅ Two-Part Fix Required

### Part 1: Update Vercel Environment Variable ⚠️ CRITICAL

1. Go to: https://vercel.com/dashboard
2. Click: **alpha-eon-frontend** (your FRONTEND project)
3. Go to: Settings → Environment Variables
4. Find: `VITE_ALPHAEON_LOCATION_ID`
5. Change value from: `15470` → `6594`
6. Click: Save

### Part 2: Deploy New Code

The code was fixed locally but not deployed yet. Deploy now:

```powershell
cd d:\shalinder\FE\frontend\alpha-eon-frontend
git add .
git commit -m "fix: update location ID to 6594 for sandbox"
git push origin main
```

Or quick deploy:
```powershell
cd alpha-eon-frontend
vercel --prod
```

---

## ⚡ Quick Check

After deployment completes (2-3 min), this URL should work:
```
https://alpha-eon-backend.vercel.app/api/alphaeon/merchant_management/v2/locations/6594/plans?amount=802
```

Test in browser:
```javascript
fetch('https://alpha-eon-backend.vercel.app/api/alphaeon/merchant_management/v2/locations/6594/plans?amount=802')
  .then(r => r.json())
  .then(d => console.log('Plans:', d));
```

---

## 🔍 Why Both Are Needed

**Environment Variable:**
- Controls runtime value in deployed app
- Must be set in Vercel dashboard

**Code Changes:**
- Updated fallback defaults from 15470 → 6594
- Must be deployed via git push or `vercel --prod`

---

## ✅ Verification Steps

1. **Check Vercel env var is updated** (6594)
2. **Push code changes** to trigger deploy
3. **Wait for deployment** (check Vercel dashboard)
4. **Test frontend** at https://alpha-eon-frontend.vercel.app/
5. **Check network tab** - should see `/locations/6594/plans`

---

## 🚨 If Still Not Working

Check deployed code has the fix:
1. Go to: https://alpha-eon-frontend.vercel.app/
2. Open browser console
3. Type: `import.meta.env.VITE_ALPHAEON_LOCATION_ID`
4. Should show: `"6594"`

If it shows 15470, the environment variable wasn't updated in Vercel.
