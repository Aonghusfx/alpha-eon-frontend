# Debug Checklist for Invoice Update Issue

## Current Status
- ✅ Frontend code implemented
- ✅ notifyAdvitalPaymentSuccess function exists
- ✅ Callback passed to SuccessStep
- ✅ Signature polling implemented
- ❌ API call not happening (no [ALPHAEON] logs)

## Possible Issues

### Issue 1: orderId Missing from URL (MOST LIKELY)
**Check:** Open browser console and look for this log:
```
❌ orderId is MISSING from URL parameters!
```

**If you see this error:**
- The backend redirect URL doesn't include orderId parameter
- Frontend cannot update invoice without knowing which invoice ID to use
- **Solution:** Backend must add orderId=INV-XXXXX to redirect URL

**Test URL should look like:**
```
https://alpha-eon-frontend.vercel.app/?amount=255&orderId=INV-1234567&locationId=FQyDM99cDn25E5lBGbOm&contactId=test&publishableKey=jYjfEW-aZG66e-w8a28d-Z6F5zB
```

### Issue 2: User Didn't Complete Full Payment Flow
**The API call only triggers AFTER signature confirmation, not after upfront payment.**

**Complete flow:**
1. ✅ User pays upfront ($1) → Your logs show this happened
2. ❓ User goes to Alphaeon financing step → Did this happen?
3. ❓ User completes financing application → Did this happen?
4. ❓ User signs digital receipt → Did this happen?
5. ❓ Signature polling detects completion → Should trigger callback
6. ❓ API call to Advital → Should update invoice

**If you stopped after step 1**, the API will never be called because it only triggers after signing (step 4).

### Issue 3: Signature Not Detected
**Check browser console for these logs:**
```
⏱ Starting polling for signature status...
🔄 Background polling for signature: XXXX
  - Current transaction status: pending/signed/completed
```

**If you see "current transaction status: pending"**, the signature hasn't been confirmed yet.

## How to Test End-to-End

### Step 1: Create Test URL with ALL Parameters
```
https://alpha-eon-frontend.vercel.app/?amount=255&orderId=INV-1339859&locationId=FQyDM99cDn25E5lBGbOm&contactId=0BawgraEOJ2cd7bRM0nR&publishableKey=jYjfEW-aZG66e-w8a28d-Z6F5zB&procedureName=Test%20Procedure
```

### Step 2: Complete Full Payment Flow
1. Enter upfront payment amount (e.g., $1)
2. Click "Continue"
3. Complete Alphaeon financing application
4. Review and submit
5. **Sign the digital receipt** ← CRITICAL
6. Wait for signature confirmation

### Step 3: Check Browser Console
Look for these specific logs:

**At page load:**
```
✅ orderId received: INV-1339859
✅ orderId format is CORRECT (INV-...)
```

**After signature:**
```
✨ Background poll CONFIRMED signature! signed
📤 Calling Advital API after signature confirmation...
🌐 API Call Details:
  URL: https://adv-dev.vercel.app/api/invoices/INV-1339859/mark-paid
✅ Advital notification completed successfully!
```

### Step 4: Check Advital Backend Logs
After signature confirmation, check Vercel logs for:
```
[ALPHAEON] Invoice marked as paid
```

## Quick Diagnosis

**Run this in browser console on the Alphaeon frontend:**
```javascript
// Check if orderId exists
const params = new URLSearchParams(window.location.search);
console.log('orderId:', params.get('orderId'));
console.log('All params:', Object.fromEntries(params));
```

**Expected output:**
```
orderId: INV-1339859
All params: { amount: "255", orderId: "INV-1339859", locationId: "...", ... }
```

**If orderId is null/undefined** → Backend needs to add it to redirect URL

## Summary

The most likely issue is **orderId is missing from the URL**. The frontend code is complete and ready, but without orderId in the URL parameters, the API call will be skipped with this warning:

```
⚠️ No orderId/invoiceId provided, skipping Advital notification
```

Check your browser console to confirm this is the issue.
