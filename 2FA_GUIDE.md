# 2FA Flow & Testing Guide

This document explains how Two-Factor Authentication (2FA) works in the application and provides a step-by-step guide to testing it using Postman.

## 1. The Normal Login Flow (No 2FA)

When a user **without** 2FA enabled logs in, the flow is standard:

1.  **Request**: `POST /api/auth/login` with `email` and `password`.
2.  **Server**: Checks credentials.
3.  **Server**: Checks `is_2fa_enabled` (it is `0` or `false`).
4.  **Response**: Returns `200 OK` with:
    ```json
    {
      "status": "success",
      "tokens": {
        "accessToken": "...",
        "refreshToken": "..."
      }
    }
    ```
5.  **Client**: Stores tokens and proceeds to valid pages.

---

## 2. enabling 2FA

To enable 2FA, the user must first be logged in normally.

### Step A: Generate QR Code
1.  **Request**: `POST /api/auth/2fa/generate`
    *   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
2.  **Server**:
    *   Generates a new secret (e.g., `KVKVK...`).
    *   Saves secret to DB (temporarily).
    *   Generates a QR Code image URL.
3.  **Response**:
    ```json
    {
      "status": "success",
      "data": {
        "qrCode": "data:image/png;base64,..."
      }
    }
    ```
4.  **User Action**: Scans the QR code with Google Authenticator (or similar app).

### Step B: Verify & Turn On
1.  **Request**: `POST /api/auth/2fa/turn-on`
    *   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
    *   **Body**:
        ```json
        { "code": "123456" }
        ```
2.  **Server**:
    *   Verifies the code against the stored secret.
    *   **If Valid**: Sets `is_2fa_enabled = 1` in the database.
3.  **Response**:
    ```json
    {
      "status": "success",
      "message": "2FA has been enabled"
    }
    ```

---

## 3. Login Flow with 2FA Enabled

Now that 2FA is active, the login process changes to a 2-step flow.

### Step 1: Initial Login (Credentials)
1.  **Request**: `POST /api/auth/login` with `email` and `password`.
2.  **Server**:
    *   Checks credentials (Correct).
    *   Checks `is_2fa_enabled` (It is `1` or `true`).
    *   **Crucial Step**: Instead of full tokens, it issues a **Temporary Token**.
3.  **Response**: Returns `200 OK`, but structurally different:
    ```json
    {
      "status": "success",
      "message": "2FA required",
      "action_required": "2fa_auth",
      "tempToken": "eyJhbGciOi..." // Valid for 5 minutes ONLY
    }
    ```

### Step 2: Finalize Login (OTP)
1.  **Request**: `POST /api/auth/2fa/authenticate`
    *   **Body**:
        ```json
        {
          "tempToken": "eyJhbGciOi...", // The token from Step 1
          "code": "123456"               // The code from Google Authenticator
        }
        ```
2.  **Server**:
    *   Decodes `tempToken`. checks `login_step === '2fa'`.
    *   Verifies `code` against user's secret in DB.
3.  **Response**: Returns the **Real** tokens:
    ```json
    {
      "status": "success",
      "tokens": {
        "accessToken": "...",
        "refreshToken": "..."
      }
    }
    ```

---

## 4. How to Test in Postman

### Scenario: Setting up 2FA
1.  **Login**: Call `POST /auth/login`. Copy the `accessToken`.
2.  **Generate**: Call `POST /auth/2fa/generate`. Add header `Authorization: Bearer <PASTE_TOKEN>`.
    *   Take the `qrCode` (base64) string.
    *   Go to [Use a Base64 Image Viewer](https://jbt.github.io/markdown-editor/) (or any browser address bar `data:image/png;base64,...`) to see the QR.
    *   Scan it with your phone.
3.  **Turn On**: Call `POST /auth/2fa/turn-on`. Add header `Authorization: Bearer <PASTE_TOKEN>`.
    *   Body: `{ "code": "<YOUR_PHONE_CODE>" }`
    *   Verify you get "2FA has been enabled".

### Scenario: Logging in with 2FA
1.  **Login**: Call `POST /auth/login` again.
    *   **Observe**: You do NOT get `tokens`. You get `tempToken`.
    *   Copy the `tempToken`.
2.  **Authenticate**: Call `POST /auth/2fa/authenticate`.
    *   Body:
        ```json
        {
          "tempToken": "<PASTE_TEMP_TOKEN>",
          "code": "<YOUR_FRESH_PHONE_CODE>"
        }
        ```
    *   **Observe**: You now receive the final `accessToken` and `refreshToken`.
3.  **Verify Access**: Call `GET /users/me` with the new `accessToken`. It should work.
