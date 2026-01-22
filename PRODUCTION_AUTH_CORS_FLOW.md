# Production Authentication & CORS Flow

## Complete End-to-End Authentication with CORS

This document shows exactly how authentication works between the Vercel-deployed frontend and ASP.NET Core backend with CORS enabled.

---

## Authentication Scenarios

### Scenario 1: User Login (with CORS Preflight)

#### Browser Step 1: Preflight (OPTIONS request)
```
Request:
  OPTIONS /api/auth/login HTTP/1.1
  Host: housingms.runasp.net
  Origin: https://your-vercel-domain.vercel.app
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type, authorization

Response (from backend):
  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
  Access-Control-Allow-Methods: POST, GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Allow-Credentials: true
  Access-Control-Max-Age: 86400
```

#### Browser Step 2: Actual Request (POST)
```
Request:
  POST /api/auth/login HTTP/1.1
  Host: housingms.runasp.net
  Origin: https://your-vercel-domain.vercel.app
  Content-Type: application/json
  Cookie: [empty - first request]

  {
    "username": "student@example.com",
    "password": "password123"
  }

Response (from backend):
  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
  Access-Control-Allow-Credentials: true
  Set-Cookie: housing.auth=abc123xyz; Path=/; HttpOnly; Secure; SameSite=None
  Content-Type: application/json

  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 12345,
      "name": "Ahmed Ali",
      "email": "student@example.com"
    }
  }
```

Browser automatically stores the cookie `housing.auth` (HttpOnly, so JS can't access it).

---

### Scenario 2: Authenticated API Request (with cookie + token)

```
Frontend Code (api.ts):
  const response = await apiClient.get('/api/students/profile');

Request (browser sends automatically):
  GET /api/students/profile HTTP/1.1
  Host: housingms.runasp.net
  Origin: https://your-vercel-domain.vercel.app
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json
  Cookie: housing.auth=abc123xyz  ← Browser auto-includes cookie

Response (from backend):
  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
  Access-Control-Allow-Credentials: true
  Content-Type: application/json

  {
    "id": 12345,
    "name": "Ahmed Ali",
    "email": "student@example.com",
    "phoneNumber": "+966501234567"
  }
```

---

### Scenario 3: Logout

```
Frontend Code:
  await apiClient.post('/api/auth/logout');

Request:
  POST /api/auth/logout HTTP/1.1
  Host: housingms.runasp.net
  Origin: https://your-vercel-domain.vercel.app
  Cookie: housing.auth=abc123xyz

Response:
  HTTP/1.1 200 OK
  Set-Cookie: housing.auth=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0
  Access-Control-Allow-Credentials: true

  { "message": "Logged out successfully" }
```

Browser automatically deletes the expired cookie.

---

## CORS Policy Decision Flow

```
Client Request from browser
         ↓
   Is it cross-origin? (Origin ≠ Server Host)
         ↓
      YES → Browser performs CORS check
         ↓
   Is it a "simple" request? (GET, POST, HEAD with standard headers)
         ↓
      NO → Browser sends OPTIONS (preflight) request
              ↓
              Backend responds with CORS headers
              ↓
              Browser checks: 
                - Access-Control-Allow-Origin matches Origin
                - Access-Control-Allow-Methods includes request method
                - Access-Control-Allow-Headers includes request headers
              ↓
              ✅ OK → Send actual request
              ❌ FAIL → Block request (CORS error)
      ↓
      YES → Browser sends actual request immediately
              ↓
              Backend responds with CORS headers
              ↓
              Browser delivers response to JavaScript
```

---

## Critical CORS Headers Explained

### Access-Control-Allow-Origin
```
// ❌ WRONG (security risk with credentials)
Access-Control-Allow-Origin: *

// ✅ CORRECT (specific origin)
Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
```
- **Why**: Browser won't send credentials (cookies) to `*` origin for security

### Access-Control-Allow-Credentials
```
// Without this header, browser won't send cookies
Access-Control-Allow-Credentials: true
```
- **Required for**: Cookie-based sessions
- **Must pair with**: Specific origin (not `*`)

### Access-Control-Allow-Methods
```
// Tells browser which HTTP methods are allowed
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Access-Control-Allow-Headers
```
// Tells browser which headers are allowed in request
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
```

### Access-Control-Max-Age
```
// Browser caches preflight response for 24 hours (86400 seconds)
// Reduces preflight requests for subsequent same calls
Access-Control-Max-Age: 86400
```

---

## Cookie Configuration: Why Each Setting Matters

### HttpOnly
```csharp
options.Cookie.HttpOnly = true;
```
- **Prevents**: JavaScript from accessing the cookie
- **Protects Against**: XSS (Cross-Site Scripting) attacks
- **Example**:
  ```javascript
  // ❌ This won't work (cookie is HttpOnly)
  console.log(document.cookie);  // output: [empty]
  
  // ✅ But browser auto-sends it in requests
  fetch('/api/profile', { credentials: 'include' });  // Cookie sent automatically
  ```

### Secure
```csharp
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
```
- **Ensures**: Cookie only sent over HTTPS
- **Prevents**: Man-in-the-middle attacks on HTTP
- **In Production**: Always use HTTPS

### SameSite=None
```csharp
options.Cookie.SameSite = SameSiteMode.None;
```
- **Allows**: Cookie to be sent in cross-origin requests
- **Note**: MUST pair with `Secure=true`
- **Security**: Only with explicit `credentials: 'include'` on frontend

| Setting | HTTP | HTTPS | Same-Origin | Cross-Origin |
|---------|------|-------|-------------|--------------|
| Secure | ❌ | ✅ | ✅ | ✅ |
| SameSite=Strict | ✅ | ✅ | ✅ | ❌ |
| SameSite=Lax | ✅ | ✅ | ✅ | ❌ (POST) |
| SameSite=None + Secure | ❌ | ✅ | ✅ | ✅ |

---

## Frontend Implementation (Already Configured)

### Axios Configuration
```typescript
// client/src/services/api.ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // https://housingms.runasp.net
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // ✅ CRITICAL: Include cookies in requests
});

// Token interceptor (for Bearer token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Fetch API with Credentials
```typescript
// Alternative: using fetch instead of axios
fetch('/api/students/profile', {
  method: 'GET',
  credentials: 'include',  // ✅ Include cookies
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## Environment Variables (Production Ready)

### .env.production (Frontend)
```
VITE_API_BASE_URL=https://housingms.runasp.net
VITE_OAUTH_SERVER_URL=https://housingms.runasp.net
VITE_APP_ID=housing-app
```

### appsettings.Production.json (Backend)
```json
{
  "Frontend": {
    "Url": "https://your-vercel-domain.vercel.app"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:...;Database=HousingMS;..."
  }
}
```

---

## Testing in Production

### Network Tab Inspection

1. **Open DevTools** (F12) → Network tab
2. **Login**:
   - Look for `POST /api/auth/login`
   - Check **Response Headers**:
     ```
     Set-Cookie: housing.auth=...
     Access-Control-Allow-Credentials: true
     Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
     ```
3. **Subsequent request**:
   - Look for any `GET /api/students/...`
   - Check **Request Headers**:
     ```
     Cookie: housing.auth=...
     Authorization: Bearer eyJ...
     ```

### Browser Console Test

```javascript
// ✅ This should work
await fetch('https://housingms.runasp.net/api/students/profile', {
  credentials: 'include',
  headers: { 'Authorization': 'Bearer ' + token }
}).then(r => r.json()).then(console.log);

// ❌ This will fail with CORS error if backend doesn't have AllowCredentials
await fetch('https://housingms.runasp.net/api/students/profile', {
  // Missing credentials: 'include'
}).then(r => r.json()).then(console.log);
```

---

## Troubleshooting: Common CORS + Auth Errors

### Error: "No 'Access-Control-Allow-Credentials' header"
```
❌ Symptom: Login works, but subsequent requests fail
❌ Cause: Backend CORS policy missing .AllowCredentials()
✅ Fix: Add .AllowCredentials() in ASP.NET CORS policy
```

### Error: "Credentials mode is 'include'"
```
❌ Symptom: CORS error mentions "credentials mode"
❌ Cause: Backend has Access-Control-Allow-Origin: * with credentials
✅ Fix: Use specific origin, not wildcard (*)
```

### Error: "The value of the 'Access-Control-Allow-Origin' header... cannot be the wildcard"
```
❌ Cause: Trying to use * with AllowCredentials()
✅ Fix: 
  policy.WithOrigins("https://your-vercel-domain.vercel.app")
       .AllowCredentials();
```

### Cookie Not Persisting Between Requests
```
❌ Cause: Frontend not using credentials: 'include'
✅ Fix: 
  // Axios: withCredentials: true
  // Fetch: credentials: 'include'
```

### CORS Preflight (OPTIONS) Returning 405
```
❌ Cause: Backend doesn't allow OPTIONS method for the endpoint
✅ Fix: Add AllowAnyMethod() in CORS policy
  policy.AllowAnyMethod()  // Allows OPTIONS, GET, POST, etc.
```

---

## Production Checklist

### Frontend ✅
- [x] `withCredentials: true` in axios client
- [x] `credentials: 'include'` in fetch requests
- [x] `.env.production` uses HTTPS URLs
- [x] No `localhost` references

### Backend ✅
- [x] CORS policy with specific origin
- [x] `.AllowCredentials()` enabled
- [x] Cookie `SameSite=None` + `Secure=true`
- [x] Middleware order: CORS before Auth
- [x] HTTPS enforced
- [x] `appsettings.Production.json` configured

### Vercel Deployment ✅
- [ ] Set environment variables
- [ ] Deploy frontend
- [ ] Test login flow
- [ ] Verify Network tab shows credentials

---

## Quick Reference

```
Frontend (HTTPS)              Backend (HTTPS)
    |                              |
    |--- POST /api/auth/login ----->|
    |                              |
    |<---- Set-Cookie Header ------|
    |                              |
    |--- GET /api/profile -------->|
    |    (with Cookie auto)        |
    |                              |
    |<---- JSON Response -----------|
```

**Key Points**:
1. Frontend uses `credentials: 'include'` or `withCredentials: true`
2. Backend responds with `Access-Control-Allow-Credentials: true`
3. Browser automatically manages cookies (HttpOnly)
4. Both must use HTTPS in production
5. Specific origin, not wildcard

---

**Status**: 🟢 Ready for Production Authentication with CORS
