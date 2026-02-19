# ft_transcendence Authentication System - Complete Documentation

This document provides an in-depth explanation of the authentication system implemented in the ft_transcendence backend. It covers all authentication mechanisms, security measures, and the complete flow of every authentication-related request.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Concepts](#2-core-concepts)
   - [JSON Web Tokens (JWT)](#21-json-web-tokens-jwt)
   - [HTTP Cookies](#22-http-cookies)
   - [Cookie Configuration & Security](#23-cookie-configuration--security)
   - [Password Hashing](#24-password-hashing)
3. [Authentication Methods](#3-authentication-methods)
   - [Standard Authentication (Email/Password)](#31-standard-authentication-emailpassword)
   - [OAuth 2.0 (Google)](#32-oauth-20-google)
   - [Two-Factor Authentication (2FA)](#33-two-factor-authentication-2fa)
4. [Passport.js Integration](#4-passportjs-integration)
5. [Middleware](#5-middleware)
6. [Token Management](#6-token-management)
7. [Database Schema](#7-database-schema)
8. [Complete API Reference](#8-complete-api-reference)
9. [Security Considerations](#9-security-considerations)
10. [Flow Diagrams](#10-flow-diagrams)

---

## 1. Overview

The authentication system in ft_transcendence is designed with security as its primary concern. It implements a **stateless, token-based authentication** system using JWTs stored in HTTP-only cookies. The system supports three authentication methods:

1. **Standard Registration/Login** - Traditional email/username and password
2. **OAuth 2.0** - Sign in with Google
3. **Two-Factor Authentication (2FA)** - Optional TOTP-based second factor

### Key Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| HTTP-Only Cookies | `httpOnly: true` | Prevents JavaScript access to tokens |
| Secure Cookies | `secure: true` (production) | Ensures HTTPS-only transmission |
| SameSite Strict | `sameSite: 'strict'` | Prevents CSRF attacks |
| Token Blacklisting | Database table | Enables secure logout |
| Password Hashing | bcrypt (10 rounds) | Protects stored passwords |
| Short-lived Access Tokens | 15 minutes | Limits exposure window |
| Refresh Token Rotation | Separate endpoint | Maintains session security |

---

## 2. Core Concepts

### 2.1 JSON Web Tokens (JWT)

#### What is JWT?

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

#### Structure of a JWT

A JWT consists of three parts separated by dots (`.`):

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature
  │      └── Payload
  └── Header
```

**1. Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
The header typically consists of the token type (JWT) and the signing algorithm being used (HMAC SHA256 in this case).

**2. Payload**
```json
{
  "id": 1,
  "username": "johndoe",
  "iat": 1707321600,
  "exp": 1707322500
}
```
The payload contains claims - statements about the user and additional metadata:
- `id`: The user's unique identifier
- `username`: The user's username
- `iat`: Issued at (timestamp)
- `exp`: Expiration time (timestamp)

**3. Signature**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```
The signature ensures that the token hasn't been tampered with.

#### JWT Implementation in ft_transcendence

```typescript
// backend/src/utils/jwt.ts

import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

// Signing a new token
export const signJwt = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, config.jwtSecret, options);
};

// Verifying and decoding a token
export const verifyJwt = (token: string): VerifyJwtResult => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return { valid: true, expired: false, decoded };
  } catch (error: unknown) {
    let expired = false;
    if (error instanceof Error && error.message === 'jwt expired')
      expired = true;
    return { valid: false, expired, decoded: null };
  }
};
```

#### Token Types in the System

| Token Type | Purpose | Expiration | Storage Location |
|------------|---------|------------|------------------|
| Access Token | Authenticate API requests | 15 minutes | Cookie (path: `/`) |
| Refresh Token | Obtain new access tokens | 3 days | Cookie (path: `/api/auth/refresh`) |
| Temp Token (2FA) | Complete 2FA login flow | 5 minutes | Response body |

---

### 2.2 HTTP Cookies

#### What are HTTP Cookies?

HTTP cookies are small pieces of data that a server sends to the user's web browser. The browser stores this data and sends it back to the same server with subsequent requests. Cookies are commonly used for session management, user preferences, and tracking.

#### Why Cookies Instead of localStorage?

| Storage Method | XSS Vulnerability | CSRF Vulnerability | HttpOnly Support |
|----------------|-------------------|--------------------| ----------------|
| localStorage | High (JavaScript readable) | None | No |
| sessionStorage | High (JavaScript readable) | None | No |
| HTTP-Only Cookies | Low (Not JS readable) | Mitigated with SameSite | Yes |

**Verdict**: HTTP-only cookies are the more secure option for storing authentication tokens because:
1. They cannot be accessed via JavaScript (`document.cookie` returns nothing for HttpOnly cookies)
2. They are automatically sent with every request to the matching domain
3. Combined with `SameSite=Strict`, they provide excellent CSRF protection

---

### 2.3 Cookie Configuration & Security

The system uses carefully configured cookie options for maximum security:

```typescript
// Base cookie options applied to all auth cookies
const cookieOptions = {
  httpOnly: true,                           // 1. Not accessible via JavaScript
  secure: config.nodeEnv === 'production',  // 2. HTTPS only in production
  sameSite: 'strict' as const,              // 3. Strict same-site policy
  path: '/',                                // 4. Cookie scope
};

// Access Token Cookie Configuration
const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Refresh Token Cookie Configuration
const refreshTokenCookieOptions = {
  ...cookieOptions,
  path: '/api/auth/refresh',  // IMPORTANT: Only sent to refresh endpoint
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
};
```

#### Cookie Attributes Explained

**1. `httpOnly: true`**
```
Set-Cookie: accessToken=eyJhbG...; HttpOnly
```
- The cookie is inaccessible to JavaScript's `Document.cookie` API
- Only the browser can read and send this cookie
- **Defense**: Prevents XSS attacks from stealing tokens

**2. `secure: true`**
```
Set-Cookie: accessToken=eyJhbG...; Secure
```
- Cookie is only sent over HTTPS connections
- Disabled in development (HTTP) for local testing
- **Defense**: Prevents man-in-the-middle attacks on public networks

**3. `sameSite: 'strict'`**
```
Set-Cookie: accessToken=eyJhbG...; SameSite=Strict
```
- Cookie is only sent if the request originates from the same site
- Blocks cross-origin requests from including the cookie
- **Defense**: Prevents CSRF (Cross-Site Request Forgery) attacks

**4. `path`**
- Access Token: `path: '/'` - Sent with ALL requests to the domain
- Refresh Token: `path: '/api/auth/refresh'` - ONLY sent to the refresh endpoint
- **Defense**: Minimizes exposure of the long-lived refresh token

**5. `maxAge`**
- Defines how long the cookie is valid
- After expiration, the browser automatically deletes it
- **Strategy**: Short-lived access tokens + longer-lived refresh tokens

---

### 2.4 Password Hashing

Passwords are never stored in plain text. The system uses **bcrypt** for password hashing.

```typescript
// backend/src/utils/crypt.ts

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash a password before storing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify a password during login
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### How bcrypt Works

1. **Salt Generation**: A random salt is generated (10 rounds = 2^10 iterations)
2. **Hashing**: The password + salt are hashed together
3. **Storage**: The salt is embedded in the hash output, so no separate storage needed

**Example Output:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 │  │  │                     │
 │  │  │                     └── Hash (31 chars)
 │  │  └── Salt (22 chars)
 │  └── Cost factor (10 rounds)
 └── Algorithm version (2b)
```

---

## 3. Authentication Methods

### 3.1 Standard Authentication (Email/Password)

#### Registration Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         REGISTRATION FLOW                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐          ┌────────┐
│   │ Browser │          │ Backend │          │   DB    │          │ bcrypt │
│   └────┬────┘          └────┬────┘          └────┬────┘          └────┬───┘
│        │                    │                    │                    │
│        │ POST /api/auth/signup                   │                    │
│        │ {username, email,  │                    │                    │
│        │  password,         │                    │                    │
│        │  confirmPassword}  │                    │                    │
│        │───────────────────>│                    │                    │
│        │                    │                    │                    │
│        │                    │ Validate input     │                    │
│        │                    │ (Zod schema)       │                    │
│        │                    │                    │                    │
│        │                    │ Check existing     │                    │
│        │                    │───────────────────>│                    │
│        │                    │<───────────────────│                    │
│        │                    │                    │                    │
│        │                    │ Hash password      │                    │
│        │                    │───────────────────────────────────────>│
│        │                    │<───────────────────────────────────────│
│        │                    │                    │                    │
│        │                    │ INSERT user        │                    │
│        │                    │───────────────────>│                    │
│        │                    │<───────────────────│                    │
│        │                    │                    │                    │
│        │                    │ Generate tokens    │                    │
│        │                    │ (access + refresh) │                    │
│        │                    │                    │                    │
│        │ 201 Created        │                    │                    │
│        │ Set-Cookie:        │                    │                    │
│        │   accessToken=...  │                    │                    │
│        │   refreshToken=... │                    │                    │
│        │<───────────────────│                    │                    │
│        │                    │                    │                    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Handler Implementation:**

```typescript
export const signupHandler = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email, password } = req.body;
    const db = getDb();

    // 1. Check for existing user
    const existingUser = db
      .prepare(
        'SELECT id, email, username FROM users WHERE email = ? OR username = ?'
      )
      .get(email, username) as User | undefined;
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email is already taken', 409);
      }
      if (existingUser.username === username) {
        throw new AppError('Username is already taken', 409);
      }
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Insert new user
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)
    `);
    const info = stmt.run(username, email, passwordHash);

    // 4. Retrieve created user
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(info.lastInsertRowid) as User;

    // 5. Generate tokens
    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );

    const refreshToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    // 6. Set cookies and respond
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  }
);
```

---

#### Login Flow (Without 2FA)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW (NO 2FA)                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                    │
│   │ Browser │          │ Backend │          │   DB    │                    │
│   └────┬────┘          └────┬────┘          └────┬────┘                    │
│        │                    │                    │                         │
│        │ POST /api/auth/login                    │                         │
│        │ {identifier,       │                    │                         │
│        │  password}         │                    │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Find user by       │                         │
│        │                    │ email OR username  │                         │
│        │                    │───────────────────>│                         │
│        │                    │<───────────────────│                         │
│        │                    │                    │                         │
│        │                    │ Verify password    │                         │
│        │                    │ (bcrypt.compare)   │                         │
│        │                    │                    │                         │
│        │                    │ Check: is_2fa_enabled = false                │
│        │                    │                    │                         │
│        │                    │ Generate tokens    │                         │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ Set-Cookie:        │                    │                         │
│        │   accessToken=...  │                    │                         │
│        │   refreshToken=... │                    │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

#### Login Flow (With 2FA Enabled)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW (WITH 2FA)                                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                    │
│   │ Browser │          │ Backend │          │   DB    │                    │
│   └────┬────┘          └────┬────┘          └────┬────┘                    │
│        │                    │                    │                         │
│        │ STEP 1: Initial login                   │                         │
│        │ POST /api/auth/login                    │                         │
│        │ {identifier, password}                  │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Find & verify user │                         │
│        │                    │───────────────────>│                         │
│        │                    │<───────────────────│                         │
│        │                    │                    │                         │
│        │                    │ Check: is_2fa_enabled = true                 │
│        │                    │                    │                         │
│        │                    │ Generate TEMP token│                         │
│        │                    │ (5 min expiry,     │                         │
│        │                    │  login_step: '2fa')│                         │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ {status: "success",│                    │                         │
│        │  message: "2FA required",               │                         │
│        │  action_required: "2fa_auth",           │                         │
│        │  tempToken: "eyJ..."}                   │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
│        │ STEP 2: Complete 2FA                    │                         │
│        │ POST /api/auth/2fa/authenticate         │                         │
│        │ {code: "123456",   │                    │                         │
│        │  tempToken: "eyJ..."}                   │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Verify tempToken   │                         │
│        │                    │ (check login_step = '2fa')                   │
│        │                    │                    │                         │
│        │                    │ Get user & secret  │                         │
│        │                    │───────────────────>│                         │
│        │                    │<───────────────────│                         │
│        │                    │                    │                         │
│        │                    │ Verify TOTP code   │                         │
│        │                    │ (otplib)           │                         │
│        │                    │                    │                         │
│        │                    │ Generate REAL tokens                         │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ Set-Cookie:        │                    │                         │
│        │   accessToken=...  │                    │                         │
│        │   refreshToken=... │                    │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
└────────────────────────────────────────────────────────────────────────────┘
```

**Login Handler Implementation:**

```typescript
export const loginHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { identifier, password } = req.body;
    const db = getDb();

    // 1. Find user by email OR username
    const user = db
      .prepare('SELECT * FROM users WHERE email = ? OR username = ?')
      .get(identifier, identifier) as User | undefined;

    // 2. Verify user exists and has a password (OAuth users might not)
    if (
      !user ||
      !user.password_hash ||
      !(await verifyPassword(password, user.password_hash))
    ) {
      return next(new AppError('Invalid email/username or password', 401));
    }

    // 3. Check if 2FA is enabled
    if (user.is_2fa_enabled) {
      // Generate temporary token (NOT the real access token)
      const tempToken = signJwt(
        { id: user.id, username: user.username, login_step: '2fa' },
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        status: 'success',
        message: '2FA required',
        action_required: '2fa_auth',
        tempToken,
      });
    }

    // 4. No 2FA - Generate real tokens
    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );

    const refreshToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    // 5. Set cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
    });
  }
);
```

---

### 3.2 OAuth 2.0 (Google)

OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on third-party services (like Google). Instead of handling passwords, the application delegates authentication to a trusted provider.

#### OAuth 2.0 Terminology

| Term | Description |
|------|-------------|
| **Resource Owner** | The user who owns the data and grants access |
| **Client** | The application (ft_transcendence) requesting access |
| **Authorization Server** | Google's OAuth server that authenticates users |
| **Resource Server** | Google's API server that holds user data |
| **Authorization Code** | Temporary code exchanged for tokens |
| **Access Token** | Google's token to access user data |
| **Redirect URI** | URL where Google sends the user after auth |

#### Complete Google OAuth Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE OAUTH 2.0 FLOW                                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌─────────┐       ┌──────────┐       ┌──────────────┐       ┌─────────┐              │
│   │ Browser │       │ Backend  │       │    Google    │       │   DB    │              │
│   └────┬────┘       └────┬─────┘       └──────┬───────┘       └────┬────┘              │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 1: User Initiates Login                                                         │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │ Click "Sign in with Google"         │                    │                   │
│        │                 │                    │                    │                   │
│        │ GET /api/oauth/google               │                    │                   │
│        │────────────────>│                    │                    │                   │
│        │                 │                    │                    │                   │
│        │                 │ Passport initiates │                    │                   │
│        │                 │ OAuth flow         │                    │                   │
│        │                 │                    │                    │                   │
│        │ 302 Redirect    │                    │                    │                   │
│        │ Location: https://accounts.google.com/o/oauth2/v2/auth   │                   │
│        │   ?client_id=YOUR_CLIENT_ID         │                    │                   │
│        │   &redirect_uri=http://localhost:3000/api/oauth/google/callback              │
│        │   &response_type=code               │                    │                   │
│        │   &scope=profile%20email            │                    │                   │
│        │<────────────────│                    │                    │                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 2: User Authenticates with Google                                               │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │ Browser redirects to Google         │                    │                   │
│        │─────────────────────────────────────>│                    │                   │
│        │                 │                    │                    │                   │
│        │                 │    ┌─────────────────────────────┐     │                   │
│        │                 │    │  Google Consent Screen      │     │                   │
│        │                 │    │  ┌───────────────────────┐  │     │                   │
│        │                 │    │  │ ft_transcendence      │  │     │                   │
│        │                 │    │  │ wants to access:      │  │     │                   │
│        │                 │    │  │ • Your email address  │  │     │                   │
│        │                 │    │  │ • Your basic profile  │  │     │                   │
│        │                 │    │  │                       │  │     │                   │
│        │                 │    │  │ [Allow]  [Deny]       │  │     │                   │
│        │                 │    │  └───────────────────────┘  │     │                   │
│        │                 │    └─────────────────────────────┘     │                   │
│        │                 │                    │                    │                   │
│        │ User clicks "Allow"                 │                    │                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 3: Google Redirects Back with Authorization Code                                │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │ 302 Redirect    │                    │                    │                   │
│        │ Location: /api/oauth/google/callback?code=AUTH_CODE_HERE │                   │
│        │<────────────────────────────────────│                    │                   │
│        │                 │                    │                    │                   │
│        │ GET /api/oauth/google/callback?code=AUTH_CODE_HERE       │                   │
│        │────────────────>│                    │                    │                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 4: Backend Exchanges Code for Google Tokens (Server-to-Server)                  │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │                 │ POST /oauth2/v4/token                   │                   │
│        │                 │ {code, client_id,  │                    │                   │
│        │                 │  client_secret,    │                    │                   │
│        │                 │  redirect_uri,     │                    │                   │
│        │                 │  grant_type}       │                    │                   │
│        │                 │───────────────────>│                    │                   │
│        │                 │                    │                    │                   │
│        │                 │ {access_token,     │                    │                   │
│        │                 │  refresh_token,    │                    │                   │
│        │                 │  id_token}         │                    │                   │
│        │                 │<───────────────────│                    │                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 5: Backend Fetches User Profile from Google                                     │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │                 │ GET /oauth2/v3/userinfo                 │                   │
│        │                 │ Authorization: Bearer {access_token}    │                   │
│        │                 │───────────────────>│                    │                   │
│        │                 │                    │                    │                   │
│        │                 │ {id: "123",        │                    │                   │
│        │                 │  email: "...",     │                    │                   │
│        │                 │  name: "...",      │                    │                   │
│        │                 │  picture: "..."}   │                    │                   │
│        │                 │<───────────────────│                    │                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 6: Backend Creates/Updates User in Database                                     │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │                 │ SELECT * FROM users WHERE google_id = ? │                   │
│        │                 │───────────────────────────────────────>│                   │
│        │                 │<───────────────────────────────────────│                   │
│        │                 │                    │                    │                   │
│        │                 │ [If not found]     │                    │                   │
│        │                 │ SELECT * FROM users WHERE email = ?     │                   │
│        │                 │───────────────────────────────────────>│                   │
│        │                 │<───────────────────────────────────────│                   │
│        │                 │                    │                    │                   │
│        │                 │ [If email exists] Link accounts          │                   │
│        │                 │ UPDATE users SET google_id = ? WHERE id = ?                 │
│        │                 │───────────────────────────────────────>│                   │
│        │                 │                    │                    │                   │
│        │                 │ [If new user] Create account            │                   │
│        │                 │ INSERT INTO users (username, email,     │                   │
│        │                 │   google_id, password_hash)             │                   │
│        │                 │ VALUES (?, ?, ?, NULL)                  │                   │
│        │                 │───────────────────────────────────────>│                   │
│        │                 │                    │                    │                   │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│   STEP 7: Backend Issues App Tokens and Redirects to Frontend                          │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│        │                 │                    │                    │                   │
│        │                 │ Generate app JWTs  │                    │                   │
│        │                 │ (access + refresh) │                    │                   │
│        │                 │                    │                    │                   │
│        │ 302 Redirect    │                    │                    │                   │
│        │ Location: http://localhost:5173/    │                    │                   │
│        │ Set-Cookie: accessToken=eyJ...      │                    │                   │
│        │ Set-Cookie: refreshToken=eyJ...     │                    │                   │
│        │<────────────────│                    │                    │                   │
│        │                 │                    │                    │                   │
│        │ User is now logged in!              │                    │                   │
│        │                 │                    │                    │                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Passport.js Google Strategy Implementation

```typescript
// backend/src/auth/config/passport.ts

import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { randomBytes } from 'crypto';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId!,
      clientSecret: config.googleClientSecret!,
      callbackURL: `${config.serverUrl}/api/oauth/google/callback`,
    },
    async (
      accessToken: string,    // Google's access token (for Google APIs)
      refreshToken: string,   // Google's refresh token
      profile: Profile,       // User's Google profile
      done: VerifyCallback    // Callback to indicate success/failure
    ) => {
      const db = getDb();

      try {
        // CASE 1: User has logged in with Google before
        const existingUser = db
          .prepare('SELECT * FROM users WHERE google_id = ?')
          .get(profile.id) as User | undefined;

        if (existingUser) {
          return done(null, existingUser);
        }

        // CASE 2: User exists with same email (link accounts)
        const email = profile.emails?.[0].value;
        if (email) {
          const userWithEmail = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get(email) as User | undefined;

          if (userWithEmail) {
            // Link Google ID to existing account
            db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(
              profile.id,
              userWithEmail.id
            );
            return done(null, userWithEmail);
          }
        }

        // CASE 3: New user - create account
        const baseName = profile.displayName
          ? profile.displayName.replace(/[^a-zA-Z0-9]/g, '')
          : 'User';

        const randomSuffix = randomBytes(3).toString('hex');
        const finalUsername = `${baseName}${randomSuffix}`;

        const stmt = db.prepare(`
          INSERT INTO users (username, email, google_id, password_hash) 
          VALUES (?, ?, ?, ?)
        `);

        // NOTE: password_hash is NULL for OAuth users
        const info = stmt.run(finalUsername, email, profile.id, null);

        const newUser = db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(info.lastInsertRowid) as User;

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
```

#### OAuth Callback Handler

```typescript
// backend/src/auth/controllers/oauth.controller.ts

export const googleAuthCallback = (req: Request, res: Response) => {
  const user = req.user as User;  // Set by Passport after verification

  // Generate OUR application's tokens (not Google's)
  const accessToken = signJwt(
    { id: user.id, username: user.username },
    { expiresIn: config.jwtAccessExpiresIn }
  );

  const refreshToken = signJwt(
    { id: user.id, username: user.username },
    { expiresIn: config.jwtRefreshExpiresIn }
  );

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  // Redirect to frontend
  res.redirect(config.corsOrigin || 'http://localhost:5173/');
};
```

#### OAuth Routes

```typescript
// backend/src/auth/routes/oauth.routes.ts

// Step 1: Initiate OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,              // We use JWTs, not sessions
    scope: ['profile', 'email'], // Request profile and email access
  })
);

// Step 2: Handle Google's callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',   // Redirect on failure
  }),
  googleAuthCallback             // Success handler
);
```

#### OAuth User Scenarios

| Scenario | Action | Result |
|----------|--------|--------|
| New user (never registered) | Create new account with Google ID | `password_hash = NULL` |
| User exists with same email | Link Google ID to existing account | Account now has both password and Google login |
| User previously logged in with Google | Find by Google ID | Login successful |
| OAuth user tries password login | `!user.password_hash` check fails | Error: "Invalid credentials" |

---

### 3.3 Two-Factor Authentication (2FA)

Two-Factor Authentication adds an extra layer of security by requiring users to provide two different authentication factors:
1. **Something they know** - Password
2. **Something they have** - Time-based code from authenticator app

#### TOTP (Time-based One-Time Password)

The system uses the TOTP algorithm (RFC 6238) implemented by the `otplib` library:

```typescript
import { authenticator } from 'otplib';

// Generate a secret key
const secret = authenticator.generateSecret();
// Example: "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD"

// Generate a QR code URI
const otpauth = authenticator.keyuri(email, 'ft_transcendence', secret);
// Example: "otpauth://totp/ft_transcendence:user@email.com?secret=KVKF...&issuer=ft_transcendence"

// Verify a code
const isValid = authenticator.verify({ token: '123456', secret });
```

#### How TOTP Works

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         TOTP ALGORITHM                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Time Window (30 seconds)                Secret Key                       │
│          │                                    │                            │
│          v                                    v                            │
│   ┌──────────────┐                    ┌──────────────┐                     │
│   │ Current Unix │                    │    Shared    │                     │
│   │  Timestamp   │                    │    Secret    │                     │
│   │  / 30        │                    │              │                     │
│   └──────┬───────┘                    └──────┬───────┘                     │
│          │                                   │                             │
│          └─────────────┬─────────────────────┘                             │
│                        │                                                   │
│                        v                                                   │
│                ┌───────────────┐                                           │
│                │  HMAC-SHA1    │                                           │
│                │   Function    │                                           │
│                └───────┬───────┘                                           │
│                        │                                                   │
│                        v                                                   │
│                ┌───────────────┐                                           │
│                │  Truncation   │                                           │
│                │   & Modulo    │                                           │
│                └───────┬───────┘                                           │
│                        │                                                   │
│                        v                                                   │
│                   ┌─────────┐                                              │
│                   │ 123456  │  <── 6-digit code                            │
│                   └─────────┘                                              │
│                                                                            │
│   Both server and authenticator app generate the same code                 │
│   because they share the same secret and use the same time                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

#### 2FA Setup Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         2FA SETUP FLOW                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                    │
│   │ Browser │          │ Backend │          │   DB    │                    │
│   └────┬────┘          └────┬────┘          └────┬────┘                    │
│        │                    │                    │                         │
│   ════════════════════════════════════════════════════════════════════     │
│   STEP 1: Generate QR Code (User must be logged in)                        │
│   ════════════════════════════════════════════════════════════════════     │
│        │                    │                    │                         │
│        │ POST /api/auth/2fa/generate            │                         │
│        │ Cookie: accessToken=...                │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Verify access token│                         │
│        │                    │ (deserializeUser)  │                         │
│        │                    │                    │                         │
│        │                    │ Generate TOTP secret                         │
│        │                    │ authenticator.generateSecret()               │
│        │                    │                    │                         │
│        │                    │ Store secret (pending)                       │
│        │                    │ UPDATE users SET two_fa_secret = ?           │
│        │                    │───────────────────>│                         │
│        │                    │                    │                         │
│        │                    │ Generate QR code   │                         │
│        │                    │ qrcode.toDataURL() │                         │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ {qrcode: "data:image/png;base64,...",  │                         │
│        │  secret: "KVKF..."}│                    │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
│   ════════════════════════════════════════════════════════════════════     │
│   STEP 2: User Scans QR Code with Authenticator App                        │
│   ════════════════════════════════════════════════════════════════════     │
│        │                    │                    │                         │
│        │    ┌─────────────────────────────┐     │                         │
│        │    │   User's Phone              │     │                         │
│        │    │   ┌───────────────────────┐ │     │                         │
│        │    │   │  Google Authenticator │ │     │                         │
│        │    │   │  ┌─────────────────┐  │ │     │                         │
│        │    │   │  │ ft_transcendence│  │ │     │                         │
│        │    │   │  │     123 456     │  │ │     │                         │
│        │    │   │  │  ▓▓▓▓▓░░░░░░░░  │  │ │     │                         │
│        │    │   │  │   (27 sec)      │  │ │     │                         │
│        │    │   │  └─────────────────┘  │ │     │                         │
│        │    │   └───────────────────────┘ │     │                         │
│        │    └─────────────────────────────┘     │                         │
│        │                    │                    │                         │
│   ════════════════════════════════════════════════════════════════════     │
│   STEP 3: Verify Code and Enable 2FA                                       │
│   ════════════════════════════════════════════════════════════════════     │
│        │                    │                    │                         │
│        │ POST /api/auth/2fa/turn-on             │                         │
│        │ Cookie: accessToken=...                │                         │
│        │ {code: "123456"}   │                    │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Get stored secret  │                         │
│        │                    │───────────────────>│                         │
│        │                    │<───────────────────│                         │
│        │                    │                    │                         │
│        │                    │ Verify code        │                         │
│        │                    │ authenticator.verify({token, secret})        │
│        │                    │                    │                         │
│        │                    │ Enable 2FA         │                         │
│        │                    │ UPDATE users SET is_2fa_enabled = 1          │
│        │                    │───────────────────>│                         │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ {message: "2FA enabled"}               │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
└────────────────────────────────────────────────────────────────────────────┘
```

#### 2FA Handler Implementations

**Generate QR Code:**

```typescript
export const generate2FaHandler = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = res.locals.user as User;

    // Generate secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      'ft_transcendence',
      secret
    );

    // Generate QR Code image (Base64)
    const imageUrl = await qrcode.toDataURL(otpauth);

    // Store secret (pending verification)
    const db = getDb();
    db.prepare('UPDATE users SET two_fa_secret = ? WHERE id = ?').run(
      secret,
      user.id
    );

    res.status(200).json({
      status: 'success',
      data: {
        qrcode: imageUrl,
        secret,  // For manual entry if QR scan fails
      },
    });
  }
);
```

**Enable 2FA:**

```typescript
export const turnOn2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const user = res.locals.user as User;
    const db = getDb();

    const userData = db
      .prepare('SELECT two_fa_secret FROM users WHERE id = ?')
      .get(user.id) as User;

    if (!userData.two_fa_secret) {
      return next(new AppError('Please generate a QR code first', 400));
    }

    const isValid = authenticator.verify({
      token: code,
      secret: userData.two_fa_secret,
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA code', 400));
    }

    db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(user.id);

    res.status(200).json({
      status: 'success',
      message: '2FA has been enabled',
    });
  }
);
```

**Authenticate with 2FA (Login Step 2):**

```typescript
export const authenticate2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, tempToken } = req.body;

    // 1. Verify the temporary token
    const { decoded, valid } = verifyJwt(tempToken);

    if (
      !valid ||
      !decoded ||
      typeof decoded === 'string' ||
      (decoded as JwtPayload).login_step !== '2fa'
    ) {
      return next(new AppError('Invalid or expired login session', 401));
    }

    // 2. Get user
    const userId = decoded.id;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
      | User
      | undefined;

    if (!user || !user.two_fa_secret) {
      return next(new AppError('User not found or 2FA not set up', 401));
    }

    // 3. Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.two_fa_secret,
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA code', 401));
    }

    // 4. Issue REAL tokens
    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );
    const refreshToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      status: 'success',
      message: '2FA authentication successful',
    });
  }
);
```

**Disable 2FA:**

```typescript
export const turnOff2FaHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const user = res.locals.user as User;
    const db = getDb();

    // Require password verification for security
    const userWithSecret = db
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .get(user.id) as User;

    if (
      !userWithSecret ||
      !(await verifyPassword(password, userWithSecret.password_hash))
    ) {
      return next(new AppError('Invalid password', 401));
    }

    // Disable 2FA and clear secret
    db.prepare(
      'UPDATE users SET is_2fa_enabled = 0, two_fa_secret = NULL WHERE id = ?'
    ).run(user.id);

    res.status(200).json({
      status: 'success',
      message: '2FA has been disabled',
    });
  }
);
```

---

## 4. Passport.js Integration

Passport.js is authentication middleware for Node.js. It provides a consistent interface for implementing various authentication strategies.

### Why Passport.js?

1. **Modular Strategies** - Each authentication method (Google, Facebook, local) is a separate "strategy"
2. **Standardized Interface** - All strategies follow the same pattern
3. **Community Support** - 500+ strategies available
4. **Express Integration** - Seamless middleware integration

### Passport Configuration

```typescript
// backend/src/auth/app.ts

import passport from 'passport';
import './config/passport.js';  // Load strategies

// Initialize Passport (no sessions)
app.use(passport.initialize());
```

### Session-less Configuration

Traditional Passport uses sessions, but this application uses JWTs instead:

```typescript
// In route handlers
passport.authenticate('google', {
  session: false,  // Don't use sessions
  scope: ['profile', 'email'],
})
```

### Passport Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      PASSPORT.JS MIDDLEWARE FLOW                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Request                                                                  │
│      │                                                                     │
│      v                                                                     │
│   ┌──────────────────────────┐                                             │
│   │ passport.authenticate() │                                             │
│   │   - Strategy: 'google'  │                                             │
│   │   - session: false      │                                             │
│   └────────────┬─────────────┘                                             │
│                │                                                           │
│                v                                                           │
│   ┌──────────────────────────┐                                             │
│   │   GoogleStrategy         │                                             │
│   │   (passport-google-oauth20)                                            │
│   └────────────┬─────────────┘                                             │
│                │                                                           │
│                v                                                           │
│   ┌──────────────────────────┐                                             │
│   │  Verify Callback         │                                             │
│   │  (your custom logic)     │                                             │
│   │  - Find/create user      │                                             │
│   │  - Call done(null, user) │                                             │
│   └────────────┬─────────────┘                                             │
│                │                                                           │
│                v                                                           │
│   ┌──────────────────────────┐                                             │
│   │  req.user = user         │  <── User object available in next handler  │
│   └────────────┬─────────────┘                                             │
│                │                                                           │
│                v                                                           │
│   ┌──────────────────────────┐                                             │
│   │  Next Middleware         │                                             │
│   │  (googleAuthCallback)    │                                             │
│   └──────────────────────────┘                                             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Middleware

### deserializeUser Middleware

This middleware runs on every request and attempts to identify the user from their access token.

```typescript
// backend/src/middleware/deserializeUser.ts

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  // No token = unauthenticated request (allow to continue)
  if (!accessToken) {
    return next();
  }

  const { decoded, valid } = verifyJwt(accessToken);

  // SECURITY: Prevent 2FA temp tokens from being used for general access
  if (decoded && (decoded as JwtPayload).login_step === '2fa') {
    return next();
  }

  if (decoded && valid) {
    const userId = (decoded as JwtPayload & { id: number }).id;
    const db = getDb();

    // Check if token is blacklisted (logged out)
    const isBlacklisted = db
      .prepare('SELECT token FROM token_blacklist WHERE token = ?')
      .get(accessToken);
    if (isBlacklisted) return next();

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (user) {
        res.locals.user = user;  // Attach user to response locals
      }
    } catch (error) {
      console.log('Error in deserializeUser middleware', error);
    }
  }

  return next();
};
```

### requireUser Middleware

Used on protected routes to ensure a valid user is authenticated.

```typescript
// backend/src/middleware/requireUser.ts

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (!user) {
    return next(
      new AppError('You must be logged in to access this resource', 401)
    );
  }
  return next();
};
```

### Middleware Chain

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     REQUEST MIDDLEWARE CHAIN                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Incoming Request                                                         │
│        │                                                                   │
│        v                                                                   │
│   ┌────────────────┐                                                       │
│   │     CORS       │  Cross-Origin Resource Sharing                        │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   ┌────────────────┐                                                       │
│   │    Morgan      │  Request logging                                      │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   ┌────────────────┐                                                       │
│   │  express.json  │  Parse JSON body                                      │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   ┌────────────────┐                                                       │
│   │ cookieParser   │  Parse cookies into req.cookies                       │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   ┌────────────────┐                                                       │
│   │deserializeUser │  Extract user from access token                       │
│   │                │  Sets res.locals.user if valid                        │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   ┌────────────────┐                                                       │
│   │    Routes      │  Route handlers                                       │
│   └────────┬───────┘                                                       │
│            │                                                               │
│            v                                                               │
│   For protected routes:                                                    │
│   ┌────────────────┐                                                       │
│   │  requireUser   │  Check res.locals.user exists                         │
│   └────────────────┘                                                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Token Management

### Token Refresh Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      TOKEN REFRESH FLOW                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                    │
│   │ Browser │          │ Backend │          │   DB    │                    │
│   └────┬────┘          └────┬────┘          └────┬────┘                    │
│        │                    │                    │                         │
│        │ Access token expired (15 min)          │                         │
│        │ API call returns 401                   │                         │
│        │                    │                    │                         │
│        │ POST /api/auth/refresh                 │                         │
│        │ Cookie: refreshToken=... (auto-sent)   │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Verify refresh token                         │
│        │                    │ verifyJwt(refreshToken)                      │
│        │                    │                    │                         │
│        │                    │ [If expired]       │                         │
│        │                    │ Return 401         │                         │
│        │                    │                    │                         │
│        │                    │ [If valid]         │                         │
│        │                    │ Check blacklist    │                         │
│        │                    │───────────────────>│                         │
│        │                    │<───────────────────│                         │
│        │                    │                    │                         │
│        │                    │ [If blacklisted]   │                         │
│        │                    │ Return 401         │                         │
│        │                    │                    │                         │
│        │                    │ [If OK]            │                         │
│        │                    │ Generate new access token                    │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ Set-Cookie:        │                    │                         │
│        │   accessToken=NEW  │                    │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
│        │ Retry original request with new token  │                         │
│        │                    │                    │                         │
└────────────────────────────────────────────────────────────────────────────┘
```

**Refresh Handler Implementation:**

```typescript
export const refreshAccessTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    // 1. Check token exists
    if (!refreshToken) {
      return next(new AppError('Could not refresh access token', 403));
    }

    // 2. Verify token
    const { valid, expired, decoded } = verifyJwt(refreshToken);

    if (expired) {
      return next(new AppError('Token expired - Please login again', 401));
    }

    if (!decoded || typeof decoded === 'string' || !valid) {
      return next(new AppError('Invalid Token - Possible Tampering', 403));
    }

    // 3. Check blacklist
    const userId = (decoded as JwtPayload & { id: number }).id;
    const db = getDb();
    const isBlacklisted = db
      .prepare('SELECT token FROM token_blacklist WHERE token = ?')
      .get(refreshToken);

    if (isBlacklisted) {
      return next(new AppError('Token revoked. Please login again', 401));
    }

    // 4. Verify user still exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
      | User
      | undefined;

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // 5. Issue new access token
    const accessToken = signJwt(
      { id: user.id, username: user.username },
      { expiresIn: config.jwtAccessExpiresIn }
    );

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
    });
  }
);
```

### Logout & Token Blacklisting

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         LOGOUT FLOW                                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                    │
│   │ Browser │          │ Backend │          │   DB    │                    │
│   └────┬────┘          └────┬────┘          └────┬────┘                    │
│        │                    │                    │                         │
│        │ POST /api/auth/logout                  │                         │
│        │ Cookie: accessToken=...                │                         │
│        │ Cookie: refreshToken=...               │                         │
│        │───────────────────>│                    │                         │
│        │                    │                    │                         │
│        │                    │ Extract tokens from cookies                  │
│        │                    │                    │                         │
│        │                    │ For each token:    │                         │
│        │                    │ - Decode (get exp) │                         │
│        │                    │ - Add to blacklist │                         │
│        │                    │───────────────────>│                         │
│        │                    │                    │                         │
│        │                    │ Clear cookies      │                         │
│        │                    │ - accessToken (path: /)                      │
│        │                    │ - refreshToken (path: /api/auth/refresh)     │
│        │                    │                    │                         │
│        │ 200 OK             │                    │                         │
│        │ Set-Cookie:        │                    │                         │
│        │   accessToken=; Max-Age=0              │                         │
│        │   refreshToken=; Max-Age=0             │                         │
│        │<───────────────────│                    │                         │
│        │                    │                    │                         │
└────────────────────────────────────────────────────────────────────────────┘
```

**Logout Handler Implementation:**

```typescript
export const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const db = getDb();
  const blacklistStmt = db.prepare(
    'INSERT OR IGNORE INTO token_blacklist (token, expires_at) VALUES (?, ?)'
  );

  const blacklistToken = (token: string) => {
    const { decoded, valid } = verifyJwt(token);

    if (valid && decoded && typeof decoded === 'object') {
      const exp = (decoded as JwtPayload).exp;
      if (exp) {
        // Store with expiration for cleanup
        const expiresAt = new Date(exp * 1000).toISOString();
        blacklistStmt.run(token, expiresAt);
      }
    }
  };

  if (accessToken) blacklistToken(accessToken);
  if (refreshToken) blacklistToken(refreshToken);

  // Clear cookies (must match the path they were set with)
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
```

---

## 7. Database Schema

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,           -- NULL for OAuth-only users

    -- OAuth
    google_id TEXT UNIQUE,        -- Google OAuth identifier

    avatar_url TEXT DEFAULT '/default-avatar.png',
    level INTEGER DEFAULT 1,
    is_2fa_enabled BOOLEAN DEFAULT 0,
    two_fa_secret TEXT,           -- TOTP secret (encrypted in production)
    status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'in_game')),
    
    -- Game stats...
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Token Blacklist Table

```sql
CREATE TABLE IF NOT EXISTS token_blacklist (
    token TEXT PRIMARY KEY,           -- The JWT string
    expires_at DATETIME NOT NULL,     -- When the token would naturally expire
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Why store `expires_at`?**  
Allows periodic cleanup of expired entries to prevent table bloat:

```sql
-- Cleanup job (can be run via cron)
DELETE FROM token_blacklist WHERE expires_at < datetime('now');
```

### User Type Definition

```typescript
// backend/src/auth/types.ts

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
  is_2fa_enabled: number;  // SQLite boolean (0 or 1)
  two_fa_secret?: string | null;
  created_at: string;
  // ...game stats
}
```

---

## 8. Complete API Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/auth/signup` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login with credentials |
| `POST` | `/api/auth/refresh` | Refresh Token | Get new access token |
| `POST` | `/api/auth/logout` | Access Token | Logout and blacklist tokens |

### OAuth Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/oauth/google` | No | Initiate Google OAuth |
| `GET` | `/api/oauth/google/callback` | No | Google OAuth callback |

### 2FA Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/auth/2fa/generate` | Access Token | Generate QR code |
| `POST` | `/api/auth/2fa/turn-on` | Access Token | Enable 2FA |
| `POST` | `/api/auth/2fa/turn-off` | Access Token | Disable 2FA |
| `POST` | `/api/auth/2fa/authenticate` | Temp Token | Complete 2FA login |

### Request/Response Examples

#### Signup

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePass123",
  "confirmPassword": "securePass123"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Set-Cookie: accessToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=259200

{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

#### Login (No 2FA)

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",
  "password": "securePass123"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Set-Cookie: accessToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=259200

{
  "status": "success",
  "message": "Logged in successfully"
}
```

#### Login (With 2FA)

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",
  "password": "securePass123"
}
```

**Response (Step 1):**
```http
HTTP/1.1 200 OK

{
  "status": "success",
  "message": "2FA required",
  "action_required": "2fa_auth",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request (Step 2):**
```http
POST /api/auth/2fa/authenticate
Content-Type: application/json

{
  "code": "123456",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Step 2):**
```http
HTTP/1.1 200 OK
Set-Cookie: accessToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
Set-Cookie: refreshToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=259200

{
  "status": "success",
  "message": "2FA authentication successful"
}
```

#### Refresh Token

**Request:**
```http
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGciOi...
```

**Response:**
```http
HTTP/1.1 200 OK
Set-Cookie: accessToken=eyJhbGciOiNEW...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900

{
  "status": "success",
  "message": "Token refreshed"
}
```

#### Logout

**Request:**
```http
POST /api/auth/logout
Cookie: accessToken=eyJhbGciOi...
Cookie: refreshToken=eyJhbGciOi...
```

**Response:**
```http
HTTP/1.1 200 OK
Set-Cookie: accessToken=; Path=/; Max-Age=0
Set-Cookie: refreshToken=; Path=/api/auth/refresh; Max-Age=0

{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 9. Security Considerations

### Attack Mitigation

| Attack Vector | Mitigation | Implementation |
|---------------|------------|----------------|
| **XSS (Token Theft)** | HTTP-Only cookies | `httpOnly: true` |
| **CSRF** | SameSite cookies | `sameSite: 'strict'` |
| **Man-in-the-Middle** | HTTPS-only cookies | `secure: true` (prod) |
| **Token Replay** | Token blacklisting | `token_blacklist` table |
| **Brute Force** | Password hashing | bcrypt with 10 rounds |
| **Session Hijacking** | Short token lifetime | Access: 15min, Refresh: 3 days |
| **2FA Bypass** | Temp token validation | `login_step: '2fa'` check |

### Security Best Practices Implemented

1. **Passwords never stored in plain text** - bcrypt hashing
2. **Tokens are not accessible via JavaScript** - HTTP-only cookies
3. **Tokens scoped appropriately** - Refresh token only sent to refresh endpoint
4. **Logged out tokens cannot be reused** - Token blacklisting
5. **OAuth users cannot use password login** - `password_hash` null check
6. **2FA temp tokens cannot access resources** - `login_step` validation
7. **Short-lived access tokens** - Limits exposure window

### Environment Configuration

```bash
# .env (production)
NODE_ENV=production
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=3d
CORS_ORIGIN=https://yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 10. Flow Diagrams

### Complete Authentication State Machine

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION STATE MACHINE                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                          ┌──────────────────┐                              │
│                          │   Unauthenticated │                              │
│                          │      (Guest)       │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                        │
│           ┌────────────────────────┼────────────────────────┐              │
│           │                        │                        │              │
│           v                        v                        v              │
│   ┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│   │    Signup     │      │     Login       │      │   OAuth Login   │     │
│   │ (email/pass)  │      │ (email/pass)    │      │    (Google)     │     │
│   └───────┬───────┘      └────────┬────────┘      └────────┬────────┘     │
│           │                       │                        │              │
│           │                       │ 2FA enabled?           │              │
│           │                       │                        │              │
│           │              ┌────────┴────────┐               │              │
│           │              │                 │               │              │
│           │          No  v             Yes v               │              │
│           │         ┌─────────┐    ┌─────────────┐         │              │
│           │         │ Login   │    │  2FA Pending │         │              │
│           │         │ Success │    │ (temp token) │         │              │
│           │         └────┬────┘    └──────┬──────┘         │              │
│           │              │                │                │              │
│           │              │         ┌──────┴──────┐         │              │
│           │              │         │ Verify TOTP │         │              │
│           │              │         │    Code     │         │              │
│           │              │         └──────┬──────┘         │              │
│           │              │                │                │              │
│           │              │         Invalid│   Valid        │              │
│           │              │           ┌────┴────┐           │              │
│           │              │           │         │           │              │
│           │              │           v         v           │              │
│           │              │       [Error]   [Success]       │              │
│           │              │                   │             │              │
│           └──────────────┴───────────────────┴─────────────┘              │
│                                    │                                       │
│                                    v                                       │
│                          ┌──────────────────┐                              │
│                          │   Authenticated   │                              │
│                          │  (has tokens)     │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                       │
│           ┌────────────────────────┼────────────────────────┐              │
│           │                        │                        │              │
│           v                        v                        v              │
│   ┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│   │ Access Token  │      │     Logout      │      │  Token Expired  │     │
│   │   Expired     │      │                 │      │  (Refresh too)  │     │
│   └───────┬───────┘      └────────┬────────┘      └────────┬────────┘     │
│           │                       │                        │              │
│           v                       │                        │              │
│   ┌───────────────┐               │                        │              │
│   │  Refresh      │               │                        │              │
│   │  Token        │               │                        │              │
│   └───────┬───────┘               │                        │              │
│           │                       │                        │              │
│           │ Success               │                        │              │
│           │    └──────────────────┼─────> [Authenticated] │              │
│           │                       │                        │              │
│           │ Failure               │                        │              │
│           └───────────────────────┴────────────────────────┘              │
│                                    │                                       │
│                                    v                                       │
│                          ┌──────────────────┐                              │
│                          │   Unauthenticated │                              │
│                          │      (Guest)       │                              │
│                          └──────────────────┘                              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

The ft_transcendence authentication system provides a robust, secure, and flexible implementation supporting multiple authentication methods. Key features include:

- **JWT-based stateless authentication** stored securely in HTTP-only cookies
- **OAuth 2.0 integration** with Google for social login
- **TOTP-based 2FA** for enhanced security
- **Token blacklisting** for secure logout
- **bcrypt password hashing** for password storage
- **Comprehensive middleware** for user deserialization and route protection

The system follows industry best practices for web security while maintaining a clean and maintainable codebase.
