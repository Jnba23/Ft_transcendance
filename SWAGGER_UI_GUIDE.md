# Swagger UI Guide

## 🔓 Understanding the Lock Icons

When you open Swagger UI at `http://localhost:3000/api-docs`, you'll see lock icons (🔒) next to some endpoints.

### What the Lock Means
- **🔒 Closed Lock** = This endpoint requires authentication
- **No Lock** = Public endpoint (no authentication needed)

This is **normal Swagger behavior** - it's not a bug!

---

## 🔑 How to Authorize (One-Time Setup)

### Step 1: Get an Access Token
First, you need to login or signup to get an access token:

1. Use **POST /auth/signup** or **POST /auth/login**
2. Copy the `accessToken` from the response

Example response:
```json
{
  "status": "success",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTY...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTY..."
  }
}
```

### Step 2: Click "Authorize" Button
At the top right of Swagger UI, click the green **"Authorize"** button.

### Step 3: Paste Your Token
1. A modal will pop up
2. **IMPORTANT:** Just paste the token directly - do NOT add "Bearer" prefix
3. Example of what to paste:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTY...
   ```
4. Click **"Authorize"**
5. Click **"Close"**

### Step 4: Test Protected Endpoints
Now all endpoints with 🔒 will work! The lock icons will turn green/open.

---

## 🎨 Visual Layout Explanation

### Top Section (Overview)
```
┌─────────────────────────────────────────┐
│ ft_transcendence API      1.0.0  OAS3.0 │
│                                          │
│ Overview                                 │
│ ├─ Authentication                        │
│ ├─ 2FA Flow                             │
│ └─ Token Lifetimes                      │
│                                          │
│ [Authorize 🔓]  ← Click here after login│
└─────────────────────────────────────────┘
```

### Endpoints Section
```
┌─────────────────────────────────────────┐
│ Auth (Authentication endpoints)          │
│                                          │
│ POST /auth/signup            [Try it]   │
│ POST /auth/login             [Try it]   │
│ POST /auth/refresh           [Try it]   │
│ POST /auth/logout 🔒         [Try it]   │ ← Needs auth
│ POST /auth/2fa/generate 🔒   [Try it]   │ ← Needs auth
│ POST /auth/2fa/turn-on 🔒    [Try it]   │ ← Needs auth
│ POST /auth/2fa/turn-off 🔒   [Try it]   │ ← Needs auth
│ POST /auth/2fa/authenticate  [Try it]   │
└─────────────────────────────────────────┘
```

---

## 📋 Quick Testing Flow in Swagger UI

### Without 2FA
```
1. Expand POST /auth/signup
2. Click "Try it out"
3. Edit the JSON body
4. Click "Execute"
5. Copy the accessToken from response
6. Click "Authorize" at top
7. Paste token (no "Bearer" prefix)
8. Now test protected endpoints (🔒)
```

### With 2FA
```
1. Login first (get tokens)
2. Authorize in Swagger
3. POST /auth/2fa/generate → Get QR code
4. Scan with authenticator app
5. POST /auth/2fa/turn-on → Enter 6-digit code
6. Logout
7. POST /auth/login → Get tempToken
8. POST /auth/2fa/authenticate → Enter code + tempToken
9. Re-authorize with new accessToken
```

---

## ⚙️ Endpoint Categories

### 🌐 Public Endpoints (No Lock)
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login (returns tokens or tempToken if 2FA enabled)
- `POST /auth/refresh` - Get new access token
- `POST /auth/2fa/authenticate` - Complete 2FA login
- `GET /users` - List all users
- `GET /users/{id}` - Get user by ID

### 🔒 Protected Endpoints (Lock Icon)
- `POST /api/auth/logout` - Blacklist tokens
- `GET /users/me` - Get your profile
- `PATCH /users/me` - Update your profile
- `POST /auth/2fa/generate` - Generate QR code
- `POST /auth/2fa/turn-on` - Enable 2FA
- `POST /auth/2fa/turn-off` - Disable 2FA

---

## 🎯 Why the Lock Icons Are Good

The lock icons are actually **helpful** because they:

1. **Instantly show** which endpoints need authentication
2. **Remind you** to authorize before testing
3. **Standard UX** - all Swagger UIs work this way
4. **Prevent errors** - you know upfront if you need a token

### Better Than Alternative
Without lock icons, you'd have to:
- Read each endpoint description
- Try the endpoint
- Get 401 error
- Realize you need auth
- Go back and authorize

---

## 🔄 Token Expiration

If you see **401 Unauthorized** errors:

1. **Access Token expired** (15 min)
   - Use `POST /auth/refresh` with your refreshToken
   - Get new accessToken
   - Re-authorize in Swagger

2. **Refresh Token expired** (3 days)
   - Login again with `POST /auth/login`
   - Get new tokens
   - Re-authorize in Swagger

3. **Token blacklisted** (after logout)
   - Login again to get fresh tokens

---

## 💡 Pro Tips

### Tip 1: Keep Token Handy
Copy your accessToken to a text file during development, so you can quickly re-authorize.

### Tip 2: Use Postman for Heavy Testing
Swagger is great for exploring the API, but Postman is better for:
- Saving requests
- Environment variables
- Automated token refresh
- Collection testing

See `POSTMAN_TESTING_GUIDE.md` for setup!

### Tip 3: Check Response Examples
Each endpoint shows example responses - click the dropdown to see:
- Normal login (no 2FA)
- 2FA required login
- Error responses

### Tip 4: Use Schema Tab
Click "Schema" tab in responses to see the data structure instead of examples.

---

## 🐛 Common Issues

### Issue: "Authorization Required" Error
**Solution:** Did you click the green "Authorize" button at the top?

### Issue: Lock Icon Still Red After Authorizing
**Solution:** 
- Check if token is expired (15 min lifetime)
- Make sure you didn't include "Bearer" prefix
- Try refreshing the page after authorizing

### Issue: Can't See Full Token in Response
**Solution:** 
- Click the response to expand it
- Or use "Copy" button to copy full response
- Or check browser console (Network tab)

### Issue: Examples Show Wrong Data
**Solution:** This is normal! Examples are just samples. Edit them before clicking "Execute".

---

## 📚 Related Documentation

- **API Testing**: See `POSTMAN_TESTING_GUIDE.md`
- **2FA Setup**: See main README or API docs
- **Authentication Flow**: See swagger Overview section

---

**The lock icons are your friends!** 🔒✨

They help you understand the API security model at a glance.
