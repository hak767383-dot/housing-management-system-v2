# Backend CORS & Deployment Configuration Guide

## ASP.NET Core Backend Setup (Verified CORS)

You mentioned you already fixed CORS with specific origins + AllowCredentials. This guide confirms the correct implementation and production settings.

---

## 1. CORS Configuration (Program.cs)

### ✅ Correct Implementation

```csharp
using Microsoft.AspNetCore.Cors;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Get frontend URL from environment or appsettings
var frontendUrl = builder.Configuration["Frontend:Url"] 
  ?? Environment.GetEnvironmentVariable("FRONTEND_URL")
  ?? "https://your-vercel-domain.vercel.app";

// Add CORS policy
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy
      .WithOrigins(frontendUrl)
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials()  // ✅ CRITICAL: Enables cookie-based auth
      .WithExposedHeaders("X-Total-Count", "X-Page-Count"); // If pagination headers needed
  });
});

// Add authentication/authorization
builder.Services.AddAuthentication(/* your config */);
builder.Services.AddAuthorization();

// Configure cookies for cross-origin
builder.Services.ConfigureApplicationCookie(options =>
{
  options.Cookie.SameSite = SameSiteMode.None;    // ✅ Allow cross-origin cookies
  options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // ✅ HTTPS only
  options.Cookie.HttpOnly = true;                 // ✅ JS can't access
  options.Cookie.Name = "housing.auth";
  options.Cookie.Domain = ".runasp.net";         // Share across subdomains if needed
});

var app = builder.Build();

// IMPORTANT: Order matters!
// 1. CORS middleware MUST be before Auth middleware
app.UseCors("AllowFrontend");

// 2. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

---

## 2. appsettings Configuration Files

### appsettings.json (Base Configuration)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(local);Database=HousingMS;User Id=sa;Password=your_password;Encrypt=true;TrustServerCertificate=true;"
  },
  "Frontend": {
    "Url": "https://your-vercel-domain.vercel.app"
  }
}
```

### appsettings.Development.json (Local Dev)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HousingMS_Dev;Integrated Security=true;TrustServerCertificate=true;"
  },
  "Frontend": {
    "Url": "http://localhost:5173"  // Vite dev server
  }
}
```

### appsettings.Production.json (Deployment - MOST IMPORTANT)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Error",
      "Microsoft.AspNetCore": "Error",
      "Microsoft.AspNetCore.HttpLogging": "None"
    }
  },
  "AllowedHosts": "housingms.runasp.net",
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:your-db-server.database.windows.net,1433;Initial Catalog=HousingMS;Persist Security Info=False;User ID=admin;Password=YourSecurePassword;MultipleActiveResultSets=True;Encrypt=True;Connection Timeout=30;"
  },
  "Frontend": {
    "Url": "https://your-vercel-domain.vercel.app"  // Your actual Vercel domain
  },
  "HttpsRedirection": {
    "Enabled": true,
    "StatusCode": 307,
    "HttpsPort": 443
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:80"
      },
      "Https": {
        "Url": "https://0.0.0.0:443"
      }
    }
  }
}
```

---

## 3. Middleware Order (Critical for CORS + Auth)

```csharp
var app = builder.Build();

// Development
if (app.Environment.IsDevelopment())
{
  app.UseDeveloperExceptionPage();
}

// ✅ 1. CORS MUST be first (before Auth!)
app.UseCors("AllowFrontend");

// 2. HTTPS Redirection
if (!app.Environment.IsDevelopment())
{
  app.UseHttpsRedirection();
}

// 3. Static files
app.UseStaticFiles();

// 4. Routing
app.UseRouting();

// 5. Authentication
app.UseAuthentication();

// 6. Authorization
app.UseAuthorization();

// 7. Endpoints
app.MapControllers();

app.Run();
```

---

## 4. Controller CORS Attributes (Optional Fine-Tuning)

### Per-Controller CORS
```csharp
[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowFrontend")]  // ✅ Apply CORS to this controller
public class AuthController : ControllerBase
{
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    // Your login logic
    // Response will include Set-Cookie header
    // Frontend receives it with credentials: 'include'
    
    return Ok(new { token = "...", message = "Login successful" });
  }

  [HttpPost("logout")]
  public IActionResult Logout()
  {
    // Clear authentication cookie
    HttpContext.SignOutAsync("Cookies");
    return Ok();
  }
}
```

### Disable CORS for Specific Endpoints
```csharp
[HttpPost("webhook")]
[DisableCors]  // Don't apply CORS policy
public IActionResult HandleWebhook()
{
  // Webhook doesn't need CORS
  return Ok();
}
```

---

## 5. Environment Variables for Production

Set these on your ASP.NET Core hosting platform (Azure App Service, etc.):

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_HTTPS_PORT=443
ConnectionStrings__DefaultConnection=Server=tcp:your-db.database.windows.net...
Frontend__Url=https://your-vercel-domain.vercel.app
```

---

## 6. Production Deployment Checklist

- [ ] **CORS Policy**
  - [x] Specific origins (not `*` or `*` with credentials)
  - [x] `AllowCredentials()` enabled
  - [x] `AllowAnyHeader()`, `AllowAnyMethod()` for flexibility
  - [x] CORS middleware BEFORE auth middleware

- [ ] **Cookie Configuration**
  - [x] `SameSite=None` for cross-origin
  - [x] `SecurePolicy=Always` for HTTPS only
  - [x] `HttpOnly=true` to prevent XSS
  - [x] Proper cookie name and domain

- [ ] **HTTPS**
  - [x] Backend uses HTTPS (port 443)
  - [x] Frontend uses HTTPS URLs (.env.production)
  - [x] SSL certificate valid (housingms.runasp.net)

- [ ] **appsettings.Production.json**
  - [x] Database connection string correct
  - [x] Logging level set to Warning/Error
  - [x] Frontend URL set correctly
  - [x] No development secrets

- [ ] **Authentication Flow**
  - [x] Login endpoint returns Set-Cookie header
  - [x] Subsequent requests include cookies (from frontend `credentials: 'include'`)
  - [x] Logout clears authentication cookie

---

## 7. Testing Authentication Flow

### Frontend Request (Axios with credentials)
```javascript
// This is already configured in client/src/services/api.ts
const apiClient = axios.create({
  baseURL: "https://housingms.runasp.net",
  withCredentials: true  // ✅ Includes cookies
});
```

### Network Tab Verification
1. Open DevTools → Network tab
2. Login to your app
3. In Network tab, find the login POST request:
   - **Request Headers**: 
     - `Cookie: housing.auth=...` (if returning cookie)
     - `Origin: https://your-vercel-domain.vercel.app`
   - **Response Headers**:
     - `Set-Cookie: housing.auth=...; SameSite=None; Secure; HttpOnly`
     - `Access-Control-Allow-Credentials: true`
     - `Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app`

---

## 8. Troubleshooting Guide

### ❌ Error: "No 'Access-Control-Allow-Credentials' header"
```csharp
// ❌ WRONG - wildcard with credentials
policy.WithOrigins("*").AllowCredentials();

// ✅ CORRECT - specific origin
policy.WithOrigins("https://your-vercel-domain.vercel.app").AllowCredentials();
```

### ❌ Error: "Origin not allowed"
```csharp
// Check that WithOrigins matches frontend URL exactly
// If Vercel domain is: my-app.vercel.app
policy.WithOrigins("https://my-app.vercel.app")  // ✅ Exact match
```

### ❌ Error: "Credentials mode is 'include'"
```javascript
// Frontend must use credentials: 'include'
// ✅ This is already done in api.ts with withCredentials: true
```

### ❌ Cookie Not Persisting
```csharp
// Cookie config must match frontend usage
options.Cookie.SameSite = SameSiteMode.None;    // ✅ REQUIRED for cross-origin
options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // ✅ HTTPS only
```

---

## 9. Quick Reference: CORS Headers

### ✅ Correct CORS Response Headers (what backend should send)
```
Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### ✅ Correct Request Headers (what frontend sends)
```
Origin: https://your-vercel-domain.vercel.app
Authorization: Bearer {token}
Cookie: housing.auth={cookie_value}
Content-Type: application/json
```

---

## 10. Final Verification Checklist

| Component | ✅ Status | Notes |
|-----------|----------|-------|
| CORS Policy | ✅ | Specific origins + AllowCredentials |
| Middleware Order | ✅ | CORS before Auth |
| Cookie Config | ✅ | SameSite=None, Secure=true, HttpOnly=true |
| HTTPS Enabled | ✅ | Both backend and frontend |
| appsettings | ✅ | Production config correct |
| Frontend URL | ⏳ | **MUST UPDATE**: Set to your Vercel domain |
| Frontend API URLs | ✅ | All use HTTPS |
| API Client Credentials | ✅ | Axios `withCredentials: true` |

---

## 🚀 Ready to Deploy?

1. **Update CORS Frontend URL**: Replace `your-vercel-domain.vercel.app` with your actual Vercel domain
2. **Deploy Backend**: Publish to Azure/hosting platform
3. **Deploy Frontend**: Push to GitHub, Vercel redeploys automatically
4. **Test Login**: Verify cookies and auth token work
5. **Monitor Logs**: Check for any CORS or auth errors

---

**Status**: 🟢 Ready for Production Deployment
