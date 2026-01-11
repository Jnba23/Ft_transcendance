# Postman Testing Guide - Authentication & 2FA

## Server Information
- **Base URL**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api-docs`

## Prerequisites
1. Make sure the backend server is running: `cd backend && npm run dev`
2. Open Postman and create a new Collection called "Ft_transcendance API"

---

## 📝 Test Flow Overview

```
1. Sign Up (Create Account)
2. Login (Get Tokens)
3. Get Current User Profile
4. Generate 2FA QR Code
5. Enable 2FA
6. Logout/Login Again (2FA Required)
7. Authenticate with 2FA Code
```

---

## 1️⃣ Sign Up (Create New User)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/signup`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }
  ```

### Expected Response (200 OK)
```json
{
  "status": "success",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📌 Save the Tokens
In Postman Tests tab, add this script to auto-save tokens:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("accessToken", response.tokens.accessToken);
    pm.collectionVariables.set("refreshToken", response.tokens.refreshToken);
}
```

---

## 2️⃣ Login (If Already Have Account)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "SecurePass123!"
  }
  ```

### Expected Response (200 OK) - Before 2FA is Enabled
```json
{
  "status": "success",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📌 Save the Tokens
Same script as signup:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.tokens) {
        pm.collectionVariables.set("accessToken", response.tokens.accessToken);
        pm.collectionVariables.set("refreshToken", response.tokens.refreshToken);
    }
    if (response.tempToken) {
        pm.collectionVariables.set("tempToken", response.tempToken);
    }
}
```

---

## 3️⃣ Get Current User Profile (Protected Route)

### Request
- **Method**: `GET`
- **URL**: `http://localhost:3000/users/me`
- **Headers**: 
  ```
  Authorization: Bearer {{accessToken}}
  ```
  *(Use the variable saved from login/signup)*

### Expected Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": null,
      "status": "online",
      "two_fa_enabled": false,
      "created_at": "2026-01-11T16:30:00.000Z",
      "updated_at": "2026-01-11T16:30:00.000Z"
    }
  }
}
```

---

## 4️⃣ Generate 2FA QR Code

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/2fa/generate`
- **Headers**: 
  ```
  Authorization: Bearer {{accessToken}}
  ```

### Expected Response (200 OK)
```json
{
  "status": "success",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

### 📌 What to Do:
1. **Copy the `qrCodeUrl`** (entire data:image string)
2. Open a browser and paste it in the address bar (it will display the QR code)
3. **Scan with an authenticator app**:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
   - 1Password
   - Or any TOTP app
4. The app will show a 6-digit code that changes every 30 seconds

**Alternative**: If you don't want to scan, you can manually enter the `secret` in your authenticator app.

---

## 5️⃣ Enable 2FA (Turn On)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/2fa/turn-on`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "code": "123456"
  }
  ```
  *Replace `123456` with the actual 6-digit code from your authenticator app*

### Expected Response (200 OK)
```json
{
  "status": "success",
  "message": "2FA has been enabled"
}
```

### ⚠️ Important
- The code changes every 30 seconds
- If you get "Invalid 2FA code", wait for the next code
- You must use a fresh code (not expired)

---

## 6️⃣ Login with 2FA Enabled

Now that 2FA is enabled, the login flow changes:

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "SecurePass123!"
  }
  ```

### Expected Response (200 OK) - With 2FA
```json
{
  "status": "success",
  "message": "2FA required",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 📌 Save the tempToken
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.tempToken) {
        pm.collectionVariables.set("tempToken", response.tempToken);
        console.log("tempToken saved:", response.tempToken);
    } else if (response.tokens) {
        pm.collectionVariables.set("accessToken", response.tokens.accessToken);
        pm.collectionVariables.set("refreshToken", response.tokens.refreshToken);
    }
}
```

---

## 7️⃣ Authenticate 2FA (Complete Login)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/2fa/authenticate`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "tempToken": "{{tempToken}}",
    "code": "123456"
  }
  ```
  *Replace `123456` with the current 6-digit code from your authenticator app*

### Expected Response (200 OK)
```json
{
  "status": "success",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📌 Save the Final Tokens
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("accessToken", response.tokens.accessToken);
    pm.collectionVariables.set("refreshToken", response.tokens.refreshToken);
    console.log("Successfully authenticated with 2FA!");
}
```

---

## 8️⃣ Refresh Access Token (Optional)

When your access token expires (15 minutes), use this:

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/refresh`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "refreshToken": "{{refreshToken}}"
  }
  ```

### Expected Response (200 OK)
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 9️⃣ Disable 2FA (Turn Off)

If you want to disable 2FA on your account:

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/2fa/turn-off`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "password": "SecurePass123!"
  }
  ```
  *Use your actual account password*

### Expected Response (200 OK)
```json
{
  "status": "success",
  "message": "2FA has been disabled"
}
```

### 📌 Important Notes
- **Password verification required** for security
- After disabling, the 2FA secret is deleted
- If you enable 2FA again, you'll need to scan a new QR code
- Future logins will NOT require 2FA codes

### Expected Errors

**401 Unauthorized - Invalid Password**
```json
{
  "status": "fail",
  "message": "Invalid password"
}
```

---

## 🔟 Logout (Blacklist Tokens)

### Request
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/logout`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "refreshToken": "{{refreshToken}}"
  }
  ```

### Expected Response (200 OK)
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### 📌 What Happens
- Both access and refresh tokens are added to blacklist
- Tokens cannot be used again
- User must login again to get new tokens

---

## 🔧 Setting Up Postman Collection Variables

1. In Postman, click on your collection
2. Go to **Variables** tab
3. Add these variables:

| Variable Name  | Initial Value | Current Value |
|----------------|---------------|---------------|
| accessToken    | (empty)       | (empty)       |
| refreshToken   | (empty)       | (empty)       |
| tempToken      | (empty)       | (empty)       |

The Test scripts will automatically populate these as you make requests.

---

## 🎯 Quick Test Sequence

### Scenario 1: New User with 2FA
```
1. POST /auth/signup → Get tokens
2. GET /users/me → Verify logged in
3. POST /auth/2fa/generate → Get QR code
4. Scan QR with authenticator app
5. POST /auth/2fa/turn-on → Enable 2FA (with code)
6. POST /auth/login → Get tempToken
7. POST /auth/2fa/authenticate → Get final tokens
8. POST /auth/2fa/turn-off → Disable 2FA (with password)
```

### Scenario 2: Existing User Without 2FA
```
1. POST /auth/login → Get tokens
2. GET /users/me → Verify profile
3. POST /auth/2fa/generate → Get QR code
4. POST /auth/2fa/turn-on → Enable 2FA
5. Test login with 2FA enabled
6. POST /auth/2fa/turn-off → Disable 2FA when done testing
```

### Scenario 3: Complete Logout Flow
```
1. POST /auth/login → Get tokens
2. GET /users/me → Use the session
3. POST /api/auth/logout → Blacklist tokens
4. Try GET /users/me again → Should fail (401)
```

---

## ❌ Common Errors & Solutions

### Error: "Invalid 2FA code"
- **Cause**: Code expired or wrong
- **Solution**: Use the current code from your authenticator app

### Error: "Refresh token is required"
- **Cause**: Missing refreshToken in body
- **Solution**: Make sure `{{refreshToken}}` variable is set

### Error: "Invalid or expired 2FA session"
- **Cause**: tempToken expired (5 minutes)
- **Solution**: Login again to get a new tempToken

### Error: "User already exists"
- **Cause**: Email already registered
- **Solution**: Use a different email or login instead

### Error: "Token is invalid or expired"
- **Cause**: accessToken expired or malformed
- **Solution**: Use refresh token to get a new access token

### Error: "Invalid password"
- **Cause**: Wrong password when trying to disable 2FA
- **Solution**: Use your correct account password

### Error: "Can't find /auth/logout"
- **Cause**: Wrong endpoint path
- **Solution**: Use `/api/auth/logout` (note the `/api` prefix)

---

## 🌐 Alternative: Test in Browser

You can also test using Swagger UI:
```
http://localhost:3000/api-docs
```

Click "Try it out" on any endpoint!

---

## 📱 Authenticator Apps Recommendations

- **Google Authenticator** (iOS/Android) - Simple, reliable
- **Microsoft Authenticator** (iOS/Android) - Backup support
- **Authy** (iOS/Android/Desktop) - Multi-device sync
- **1Password** (Premium) - Password manager integration

---

## 🔒 Security Notes

- Access tokens expire after **15 minutes**
- Refresh tokens expire after **3 days**
- Temp tokens (2FA) expire after **5 minutes**
- 2FA codes change every **30 seconds**
- Once 2FA is enabled, it's required for all logins

---

## 📊 Database Check (Optional)

To verify 2FA is enabled in database:
```bash
cd backend
sqlite3 data/app.db "SELECT id, email, two_fa_enabled FROM users;"
```

---

**Happy Testing! 🚀**

If you encounter any issues, check:
1. Server is running: `http://localhost:3000`
2. Tokens are saved in collection variables
3. Using fresh 2FA codes from authenticator app
