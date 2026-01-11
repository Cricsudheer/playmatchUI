# Authentication Testing Checklist

## Critical Bug Fixes Applied

### 1. Signup Redirect Bug (FIXED ✓)
**Issue**: Failed signup (duplicate email) was redirecting to dashboard
**Root Causes**:
- Missing response validation in authService
- No explicit state clearing on error
- Potential race condition with useEffect

**Fixes Applied**:
- ✅ Added response body validation in register()
- ✅ Added explicit error response parsing
- ✅ Clear auth state before and after failed registration
- ✅ Validate response structure before proceeding to auto-login
- ✅ Only call login() after successful registration validation
- ✅ Added comprehensive error logging for debugging

### 2. Additional Error Handling Improvements
- ✅ Enhanced login() with response validation
- ✅ Enhanced refreshToken() with validation and cleanup
- ✅ Explicit state clearing in useAuth on all errors
- ✅ Better network error detection
- ✅ Console logging for debugging

---

## Test Scenarios (Please Test All)

### Test 1: Failed Signup - Duplicate Email ⚠️ CRITICAL
**Steps**:
1. Open http://localhost:5173/signup
2. Enter a name, gender, and password
3. Use an email that ALREADY EXISTS in database
4. Submit the form

**Expected Behavior**:
- ✅ Error message should appear in red banner
- ✅ Should stay on signup page (NOT redirect to dashboard)
- ✅ Check console for logs: `[authService] Registration failed:`
- ✅ Form should be enabled again
- ✅ User should NOT be logged in

**What to Check in Console**:
```
[SignupPage] Starting registration...
[authService] Sending registration request...
[authService] Registration response status: 409
[authService] Registration error response: {...}
[authService] Registration failed: Email already registered. Please login.
[SignupPage] Registration failed: Email already registered. Please login.
```

---

### Test 2: Successful Signup
**Steps**:
1. Open http://localhost:5173/signup
2. Enter valid data with a NEW email
3. Submit the form

**Expected Behavior**:
- ✅ Registration succeeds
- ✅ Auto-login happens
- ✅ Redirects to dashboard
- ✅ Navigation shows user name
- ✅ Check console for success logs

**Console Output**:
```
[SignupPage] Starting registration...
[authService] Sending registration request...
[authService] Registration response status: 200
[authService] User registered successfully: email@example.com
[authService] Attempting auto-login after registration...
[authService] Auto-login successful
[SignupPage] Registration successful, navigating to dashboard
```

---

### Test 3: Failed Login - Wrong Password
**Steps**:
1. Navigate to http://localhost:5173/login
2. Enter valid email but WRONG password
3. Submit

**Expected Behavior**:
- ✅ Error banner appears
- ✅ Stays on login page
- ✅ User is NOT logged in
- ✅ No redirect to dashboard

---

### Test 4: Successful Login
**Steps**:
1. Navigate to http://localhost:5173/login
2. Enter correct credentials
3. Submit

**Expected Behavior**:
- ✅ Redirects to dashboard
- ✅ User name appears in navigation
- ✅ Can access /awards page
- ✅ Logout button visible

---

### Test 5: Protected Routes (Logged Out)
**Steps**:
1. Ensure you're logged out
2. Try to navigate to http://localhost:5173/
3. Try to navigate to http://localhost:5173/awards

**Expected Behavior**:
- ✅ Both redirect to /login
- ✅ After login, redirects back to originally requested page

---

### Test 6: Already Authenticated Redirect
**Steps**:
1. Login successfully first
2. Try to navigate to http://localhost:5173/login
3. Try to navigate to http://localhost:5173/signup

**Expected Behavior**:
- ✅ Both immediately redirect to dashboard
- ✅ No flash of login/signup form

---

### Test 7: Logout
**Steps**:
1. Login successfully
2. Click "Logout" button in navigation

**Expected Behavior**:
- ✅ Redirects to /login
- ✅ localStorage is cleared (check DevTools → Application → Local Storage)
- ✅ Attempting to visit / or /awards redirects back to login

---

### Test 8: Token Refresh on Page Reload
**Steps**:
1. Login successfully
2. Refresh the page (F5)

**Expected Behavior**:
- ✅ User stays logged in
- ✅ Dashboard still accessible
- ✅ User name still in navigation

---

### Test 9: Form Validation
**Signup Page**:
- ✅ Empty fields → Shows "required" errors
- ✅ Invalid email → Shows "valid email" error
- ✅ Short password → Shows "8+ characters" error
- ✅ Weak password → Shows "letter and number" error
- ✅ Password mismatch → Shows "passwords do not match"
- ✅ Missing gender → Shows "select gender" error

**Login Page**:
- ✅ Empty email → Shows error
- ✅ Empty password → Shows error
- ✅ Invalid email format → Shows error

---

### Test 10: Network Error Handling
**Steps**:
1. Stop the backend server (localhost:8080)
2. Try to login or signup

**Expected Behavior**:
- ✅ Shows network error message
- ✅ Does not redirect
- ✅ Form re-enables

---

## Browser DevTools Checks

### localStorage (Application → Local Storage)
After successful login, should contain:
- ✅ `playmatch_access_token`: JWT token string
- ✅ `playmatch_user`: JSON with {id, name, email, gender, ...}

After logout, should be:
- ✅ Empty (both keys removed)

### Cookies (Application → Cookies)
- ✅ `refreshToken`: httpOnly cookie (set by backend)
- Note: You may not be able to see httpOnly cookies in DevTools

### Console
- ✅ No uncaught errors
- ✅ Debug logs show proper flow
- ✅ Error logs clearly indicate failures

### Network Tab
**Successful Signup**:
1. POST /v1/auth/register → 200 OK
2. POST /v1/auth/login → 200 OK (auto-login)

**Failed Signup (duplicate email)**:
1. POST /v1/auth/register → 409 Conflict

**Successful Login**:
1. POST /v1/auth/login → 200 OK

---

## Known Backend Issues to Check

If any of the following occur, the backend may not be following REST conventions:

1. **200 status with error in body**: Backend returns 200 OK but error message in response body
   - Our code now validates response structure
   - Should catch this and throw error

2. **Missing required fields**: Backend returns 200 but missing accessToken or user
   - Our code now validates required fields
   - Should throw "Invalid response from server"

3. **Malformed JSON**: Backend returns invalid JSON
   - Our code catches parse errors
   - Should show appropriate error message

---

## Quick Debug Commands

Check localStorage:
```javascript
// In browser console
localStorage.getItem('playmatch_access_token')
localStorage.getItem('playmatch_user')
```

Clear localStorage manually:
```javascript
localStorage.clear()
```

View all auth state:
```javascript
console.log({
  token: localStorage.getItem('playmatch_access_token'),
  user: JSON.parse(localStorage.getItem('playmatch_user'))
})
```

---

## If You Find More Bugs

1. Open browser DevTools Console
2. Reproduce the bug
3. Copy all console logs (especially [authService] and [SignupPage] prefixed logs)
4. Check Network tab for API request/response
5. Check localStorage state
6. Report with all details

---

## Summary of Changes

**Files Modified**:
1. `/src/services/authService.js` - Enhanced error handling, response validation, logging
2. `/src/hooks/useAuth.js` - Explicit state clearing on errors, defensive auth state management
3. `/src/pages/SignupPage.jsx` - Added logging, explicit return on error
4. `/src/services/authService.js` - refreshToken now clears auth on failure

**Key Improvements**:
- Response validation before proceeding
- Explicit error state clearing
- Better error messages from backend
- Comprehensive logging for debugging
- Defense against malformed responses
- No more premature redirects on failure
