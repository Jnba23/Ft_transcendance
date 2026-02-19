# File Upload System Documentation

## Table of Contents

1. [Overview](#overview)
2. [File Upload Configuration](#file-upload-configuration)
3. [Controller Logic](#controller-logic)
4. [Routes Configuration](#routes-configuration)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Error Handling](#error-handling)
7. [Database Considerations](#database-considerations)

---

## Overview

This file upload system handles **avatar uploads** for users. It uses:

- **Multer**: Middleware for handling `multipart/form-data`
- **UUID**: For generating unique filenames
- **Express Static**: For serving uploaded files

### System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Multer    │────▶│  Controller │────▶│  Database   │
│  (FormData) │     │ (Save File) │     │ (Save URL)  │     │ (Store URL) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   /uploads  │
                    │  (Disk)     │
                    └─────────────┘
```

---

## File Upload Configuration

### File: `fileUpload.ts`

```typescript
import multer from 'multer';
```

**`import`**: ES6 keyword to bring external modules into scope.

**`multer`**: A Node.js middleware for handling `multipart/form-data`, which is the encoding type used when uploading files through HTML forms.

**`from 'multer'`**: Specifies the npm package name to import from.

---

```typescript
import path from 'path';
```

**`path`**: Node.js built-in module for working with file and directory paths. Provides utilities like:
- `path.join()` - Joins path segments
- `path.extname()` - Gets file extension

---

```typescript
import { v4 as uuidv4 } from 'uuid';
```

**`{ v4 as uuidv4 }`**: Named import with alias.

**`v4`**: Version 4 UUID generator (random-based).

**`as uuidv4`**: Renames `v4` to `uuidv4` for clarity.

**UUID Example**: `550e8400-e29b-41d4-a716-446655440000`

---

```typescript
import fs from 'fs';
```

**`fs`**: Node.js File System module. Provides functions to:
- Create/delete files and directories
- Read/write file contents
- Check if files exist

---

```typescript
import { AppError } from './AppError.js';
```

**`AppError`**: Custom error class for consistent error handling across the application.

**`.js`**: Required in ES modules even for TypeScript files (compiled output).

---

```typescript
const uploadDir = path.join(process.cwd(), 'uploads');
```

**`const`**: Declares a constant variable (cannot be reassigned).

**`uploadDir`**: Variable name storing the upload directory path.

**`path.join()`**: Safely joins path segments using the OS-specific separator.
- Windows: `C:\project\uploads`
- Linux/Mac: `/home/user/project/uploads`

**`process.cwd()`**: Returns the **C**urrent **W**orking **D**irectory (where the Node.js process was launched).

**`'uploads'`**: Folder name where files will be stored.

**Result**: `/home/salah-eddin/ft_transcendence_42/backend/uploads`

---

```typescript
fs.mkdirSync(uploadDir, { recursive: true });
```

**`fs.mkdirSync()`**: **Sync**hronously creates a directory.

**`uploadDir`**: The path to create.

**`{ recursive: true }`**: Options object:
- **`recursive: true`**: Creates parent directories if they don't exist
- Also prevents error if directory already exists

**Why Sync?**: This runs once at module load time (server startup), not during request handling.

---

### Storage Configuration

```typescript
const storage = multer.diskStorage({
```

**`multer.diskStorage()`**: Creates a storage engine that saves files to disk.

**Alternative**: `multer.memoryStorage()` - Stores files in memory as `Buffer` objects.

---

```typescript
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
```

**`destination`**: Function that determines where to store uploaded files.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `req` | `Request` | Express request object |
| `file` | `Express.Multer.File` | Information about the uploaded file |
| `cb` | `Function` | Callback to signal completion |

**`cb(null, uploadDir)`**: Callback pattern:
- First argument: Error (null = no error)
- Second argument: Destination path

---

```typescript
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
```

**`filename`**: Function that determines the file's name on disk.

**`uuidv4()`**: Generates a random unique identifier.

**`path.extname(file.originalname)`**: Extracts the file extension.
- Input: `profile-photo.jpg`
- Output: `.jpg`

**Template Literal**: `` `${uuidv4()}${path.extname()}` ``
- Combines UUID + extension
- Result: `550e8400-e29b-41d4-a716-446655440000.jpg`

**Why UUID?**:
1. Prevents filename collisions
2. Hides original filename (security)
3. No special characters to escape

---

### File Filter

```typescript
const fileFilter = (req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
```

**`fileFilter`**: Function that controls which files are accepted.

**`req: unknown`**: Request object typed as `unknown` (not used in this function).

**`file: Express.Multer.File`**: Contains file metadata:
```typescript
interface File {
    fieldname: string;    // Form field name ('avatar')
    originalname: string; // Original filename ('photo.jpg')
    encoding: string;     // Encoding type ('7bit')
    mimetype: string;     // MIME type ('image/jpeg')
    size: number;         // File size in bytes
    destination: string;  // Upload directory
    filename: string;     // Generated filename
    path: string;         // Full path to file
}
```

**`cb: multer.FileFilterCallback`**: Callback to accept/reject the file.

---

```typescript
    const allowedTypes = ['image/jpeg', 'image/png'];
```

**`allowedTypes`**: Array of accepted MIME types.

| MIME Type | Extension | Description |
|-----------|-----------|-------------|
| `image/jpeg` | `.jpg`, `.jpeg` | JPEG images |
| `image/png` | `.png` | PNG images |

**Not Allowed**: `.gif`, `.webp`, `.svg`, `.bmp`, etc.

---

```typescript
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Only images allowed', 400));
    }
```

**`allowedTypes.includes(file.mimetype)`**: Checks if the file's MIME type is in the allowed list.

**`cb(null, true)`**: Accept the file.
- First argument: Error (null = no error)
- Second argument: Accept file (true)

**`cb(new AppError(...))`**: Reject with error.
- `400`: HTTP Bad Request status code

---

### Multer Instance

```typescript
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});
```

**`export`**: Makes `upload` available to other modules.

**`multer({...})`**: Creates configured Multer instance.

**`storage`**: Shorthand for `storage: storage` (ES6 property shorthand).

**`fileFilter`**: Shorthand for `fileFilter: fileFilter`.

**`limits`**: Restrictions on uploaded data:

| Property | Value | Meaning |
|----------|-------|---------|
| `fileSize` | `5 * 1024 * 1024` | 5 MB maximum |

**Calculation**: `5 * 1024 * 1024 = 5,242,880 bytes = 5 MB`

---

## Controller Logic

### File: `controller.ts`

### Imports

```typescript
import fs from 'fs/promises';
```

**`fs/promises`**: Promise-based version of the `fs` module.

**Difference**:
```typescript
// Callback-based (old)
fs.unlink(path, (err) => { ... });

// Promise-based (modern)
await fs.unlink(path);
```

---

```typescript
import path from 'path';
```

Same as before - for path manipulation.

---

### Constants

```typescript
const DEFAULT_AVATAR = '/uploads/default-avatar.png';
```

**`DEFAULT_AVATAR`**: URL path to the default avatar image.

**Purpose**: 
- New users get this avatar
- Users can reset to this avatar
- Should never be deleted from disk

---

### Helper Functions

```typescript
const deleteFile = async (filePath: string): Promise<void> => {
```

**`async`**: Makes the function return a Promise and allows `await` inside.

**`filePath: string`**: Parameter with TypeScript type annotation.

**`Promise<void>`**: Return type - Promise that resolves to nothing.

---

```typescript
    try {
        await fs.unlink(filePath);
    } catch (err) {
```

**`try/catch`**: Error handling block.

**`await fs.unlink(filePath)`**: Asynchronously deletes a file.
- `await`: Pauses execution until Promise resolves
- `fs.unlink()`: Deletes the file at the given path

---

```typescript
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error('Failed to delete file:', err);
        }
```

**`err as NodeJS.ErrnoException`**: Type assertion telling TypeScript the error type.

**`NodeJS.ErrnoException`**: Node.js error type with properties:
- `code`: Error code string
- `errno`: Error number
- `syscall`: System call that failed
- `path`: File path that caused error

**`'ENOENT'`**: **E**rror **NO** **ENT**ry - File doesn't exist.

**Logic**: Only log error if it's NOT a "file not found" error (because that's fine - file is already gone).

---

```typescript
const isDeletableAvatar = (avatarUrl: string | null | undefined): boolean => {
    return !!(
        avatarUrl &&
        avatarUrl.startsWith('/uploads/') &&
        avatarUrl !== DEFAULT_AVATAR
    );
};
```

**`avatarUrl: string | null | undefined`**: Parameter can be string, null, or undefined.

**`: boolean`**: Function returns a boolean.

**`!!(...)`**: Double negation - converts any value to boolean.

**Conditions** (all must be true):

| Condition | Purpose |
|-----------|---------|
| `avatarUrl` | Not null/undefined/empty |
| `.startsWith('/uploads/')` | Is a local upload (not external URL) |
| `!== DEFAULT_AVATAR` | Not the default avatar |

**Returns `true` if**: Avatar is a custom upload that can be safely deleted.

---

### Update User Handler

```typescript
export const updateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
```

**`export`**: Makes function available to routes.

**`async`**: Enables `await` usage inside.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `req` | `Request` | Incoming HTTP request |
| `res` | `Response` | HTTP response object |
| `next` | `NextFunction` | Passes control to next middleware |

---

```typescript
    const { username } = req.body;
```

**Destructuring**: Extracts `username` property from `req.body`.

**`req.body`**: Contains parsed request body data (from `express.json()` or Multer).

---

```typescript
    const currentUser = res.locals.user as User;
```

**`res.locals`**: Object for passing data between middleware.

**`res.locals.user`**: Set by `deserializeUser` middleware.

**`as User`**: Type assertion - tells TypeScript the type.

---

```typescript
    try {
        if (username) {
            const existing = userService.findByUsername(username, currentUser.id);
            if (existing) {
```

**Username Validation Flow**:
1. Check if username was provided
2. Search for another user with that username
3. Exclude current user from search (second parameter)

---

```typescript
                if (req.file) {
                    await deleteFile(req.file.path);
                }
                return next(new AppError('Username already taken', 409));
```

**Cleanup on Validation Failure**:
- If a file was uploaded but validation fails, delete it
- `409`: HTTP Conflict status code

**`req.file`**: Populated by Multer with uploaded file info:
```typescript
{
    fieldname: 'avatar',
    originalname: 'my-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: '/home/.../uploads',
    filename: '550e8400-e29b-41d4-a716-446655440000.jpg',
    path: '/home/.../uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
    size: 102400
}
```

---

```typescript
        let avatarUrl: string | undefined;
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
```

**`let`**: Variable that can be reassigned.

**`string | undefined`**: Type annotation - can be string or undefined.

**`/uploads/${req.file.filename}`**: Constructs the URL path:
- Input filename: `550e8400-e29b-41d4-a716-446655440000.jpg`
- Result: `/uploads/550e8400-e29b-41d4-a716-446655440000.jpg`

---

```typescript
            const oldUser = userService.findById(currentUser.id);
            if (isDeletableAvatar(oldUser?.avatarUrl)) {
                const oldPath = path.join(process.cwd(), oldUser!.avatarUrl);
                await deleteFile(oldPath);
            }
```

**Old Avatar Cleanup**:

**`oldUser?.avatarUrl`**: Optional chaining - returns `undefined` if `oldUser` is null/undefined.

**`isDeletableAvatar()`**: Checks if old avatar should be deleted.

**`oldUser!.avatarUrl`**: Non-null assertion - we know `oldUser` exists because `isDeletableAvatar` returned true.

**`path.join(process.cwd(), oldUser!.avatarUrl)`**: Converts URL path to filesystem path:
- Input: `/uploads/old-avatar.jpg`
- Output: `/home/salah-eddin/ft_transcendence_42/backend/uploads/old-avatar.jpg`

---

```typescript
        const updateData: { username?: string; avatarUrl?: string } = {};
        if (username) updateData.username = username;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
```

**Dynamic Object Building**:

**`{ username?: string; avatarUrl?: string }`**: TypeScript inline type - both properties optional.

**`{}`**: Start with empty object.

**Conditional Assignment**: Only add properties that have values.

**Possible Results**:
```typescript
{}                                    // Nothing to update
{ username: 'newname' }               // Only username
{ avatarUrl: '/uploads/...' }         // Only avatar
{ username: 'newname', avatarUrl: '/uploads/...' }  // Both
```

---

```typescript
        userService.updateProfile(currentUser.id, updateData);

        const updatedUser = userService.findById(currentUser.id)!;
```

**`updateProfile()`**: Updates user in database.

**`findById()!`**: Fetches updated user data.
- `!`: Non-null assertion (user must exist - middleware guarantees it)

---

```typescript
        res.status(200).json({
            status: 'success',
            data: {
                user: userService.getSanitizedUser(updatedUser),
            },
        });
```

**Response**:

**`res.status(200)`**: Sets HTTP status code (OK).

**`.json({...})`**: Sends JSON response.

**`getSanitizedUser()`**: Removes sensitive fields (password hash, etc.).

---

```typescript
    } catch (error) {
        if (req.file) {
            await deleteFile(req.file.path);
        }
        next(error);
    }
```

**Error Handler**:
1. Delete uploaded file (prevent orphan files)
2. Pass error to Express error handler

---

### Reset Avatar Handler

```typescript
export const resetAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = res.locals.user as User;

    try {
        const oldUser = userService.findById(currentUser.id);

        if (isDeletableAvatar(oldUser?.avatarUrl)) {
            const oldPath = path.join(process.cwd(), oldUser!.avatarUrl);
            await deleteFile(oldPath);
        }

        userService.updateProfile(currentUser.id, { avatarUrl: DEFAULT_AVATAR });

        const updatedUser = userService.findById(currentUser.id)!;

        res.status(200).json({
            status: 'success',
            data: {
                user: userService.getSanitizedUser(updatedUser),
            },
        });
    } catch (error) {
        next(error);
    }
};
```

**Purpose**: Resets user's avatar to the default image.

**Flow**:
1. Get current user data
2. Delete current avatar if it's a custom upload
3. Update database to use default avatar
4. Return updated user

---

## Routes Configuration

### File: `routes.ts`

```typescript
router.patch(
    '/me',
    requireUser,
    upload.single('avatar'),
    validateResource(updateUserSchema),
    updateUserHandler
);
```

**Middleware Order** (Critical!):

| Order | Middleware | Purpose |
|-------|------------|---------|
| 1 | `requireUser` | Ensures user is authenticated |
| 2 | `upload.single('avatar')` | Parses file upload |
| 3 | `validateResource(...)` | Validates request body |
| 4 | `updateUserHandler` | Handles the request |

**`upload.single('avatar')`**: 
- `single`: Expects one file
- `'avatar'`: Form field name

**Why Multer Before Validation?**: Multer parses `multipart/form-data`. Without it, `req.body` would be empty.

---

```typescript
router.delete('/me/avatar', requireUser, resetAvatarHandler);
```

**`DELETE /me/avatar`**: Resets avatar to default.

**No Multer needed**: No file upload involved.

---

## Data Flow Diagrams

### Flow 1: Successful Avatar Upload

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUCCESSFUL UPLOAD FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ PATCH /api/users/me                     │
   │ Content-Type: multipart/form-data       │
   │                                         │
   │ FormData:                               │
   │   - avatar: [binary image data]         │
   │   - username: "newname" (optional)      │
   └─────────────────────────────────────────┘
                      │
                      ▼
2. requireUser MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ ✓ Check res.locals.user exists          │
   │ ✓ User authenticated                    │
   │ → Continue to next middleware           │
   └─────────────────────────────────────────┘
                      │
                      ▼
3. upload.single('avatar') MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ a) Parse multipart/form-data            │
   │ b) Extract file from 'avatar' field     │
   │ c) Run fileFilter:                      │
   │    - Check mimetype is image/jpeg|png   │
   │ d) Check file size ≤ 5MB                │
   │ e) Generate UUID filename               │
   │ f) Save to /uploads/uuid.ext            │
   │ g) Populate req.file object             │
   │ h) Populate req.body with other fields  │
   └─────────────────────────────────────────┘
                      │
                      ▼
4. validateResource MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ Validate req.body against schema:       │
   │ - username: min 4 chars (if provided)   │
   └─────────────────────────────────────────┘
                      │
                      ▼
5. updateUserHandler CONTROLLER
   ┌─────────────────────────────────────────┐
   │ a) Check username uniqueness            │
   │ b) Build avatarUrl from req.file        │
   │ c) Delete old avatar (if deletable)     │
   │ d) Update database                      │
   │ e) Return updated user                  │
   └─────────────────────────────────────────┘
                      │
                      ▼
6. RESPONSE
   ┌─────────────────────────────────────────┐
   │ HTTP 200 OK                             │
   │ {                                       │
   │   "status": "success",                  │
   │   "data": {                             │
   │     "user": {                           │
   │       "id": 1,                          │
   │       "username": "newname",            │
   │       "avatarUrl": "/uploads/uuid.jpg"  │
   │     }                                   │
   │   }                                     │
   │ }                                       │
   └─────────────────────────────────────────┘
```

### Flow 2: Invalid File Type

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INVALID FILE TYPE FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ PATCH /api/users/me                     │
   │ FormData:                               │
   │   - avatar: document.pdf ← INVALID      │
   └─────────────────────────────────────────┘
                      │
                      ▼
2. requireUser MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ ✓ User authenticated                    │
   └─────────────────────────────────────────┘
                      │
                      ▼
3. upload.single('avatar') MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ fileFilter checks mimetype:             │
   │                                         │
   │ file.mimetype = 'application/pdf'       │
   │ allowedTypes = ['image/jpeg', 'image/png']│
   │                                         │
   │ ✗ NOT in allowedTypes                   │
   │ → cb(new AppError('Invalid file...'))   │
   └─────────────────────────────────────────┘
                      │
                      ▼
4. ERROR HANDLER
   ┌─────────────────────────────────────────┐
   │ HTTP 400 Bad Request                    │
   │ {                                       │
   │   "status": "error",                    │
   │   "message": "Invalid file type..."     │
   │ }                                       │
   └─────────────────────────────────────────┘

   ⚠️ FILE IS NOT SAVED TO DISK
```

### Flow 3: File Too Large

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FILE TOO LARGE FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ PATCH /api/users/me                     │
   │ FormData:                               │
   │   - avatar: huge-image.jpg (10MB)       │
   └─────────────────────────────────────────┘
                      │
                      ▼
2. upload.single('avatar') MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ Checks limits.fileSize:                 │
   │                                         │
   │ file.size = 10,485,760 bytes (10MB)     │
   │ limit = 5,242,880 bytes (5MB)           │
   │                                         │
   │ ✗ EXCEEDS LIMIT                         │
   │ → Multer throws MulterError             │
   └─────────────────────────────────────────┘
                      │
                      ▼
3. ERROR HANDLER
   ┌─────────────────────────────────────────┐
   │ HTTP 400 Bad Request                    │
   │ {                                       │
   │   "status": "error",                    │
   │   "message": "File too large"           │
   │ }                                       │
   └─────────────────────────────────────────┘

   ⚠️ PARTIAL FILE MAY BE WRITTEN - Consider cleanup
```

### Flow 4: Username Already Taken (After File Upload)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USERNAME CONFLICT FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ PATCH /api/users/me                     │
   │ FormData:                               │
   │   - avatar: photo.jpg                   │
   │   - username: "existinguser"            │
   └─────────────────────────────────────────┘
                      │
                      ▼
2-4. MIDDLEWARE CHAIN
   ┌─────────────────────────────────────────┐
   │ ✓ requireUser passes                    │
   │ ✓ Multer saves file to disk             │
   │ ✓ validateResource passes               │
   └─────────────────────────────────────────┘
                      │
                      ▼
5. updateUserHandler CONTROLLER
   ┌─────────────────────────────────────────┐
   │ Check username uniqueness:              │
   │                                         │
   │ userService.findByUsername('existinguser')│
   │ → Returns existing user                 │
   │                                         │
   │ ✗ USERNAME TAKEN                        │
   │                                         │
   │ CLEANUP:                                │
   │ → Delete uploaded file from disk        │
   │   await deleteFile(req.file.path)       │
   │                                         │
   │ → Return error                          │
   └─────────────────────────────────────────┘
                      │
                      ▼
6. RESPONSE
   ┌─────────────────────────────────────────┐
   │ HTTP 409 Conflict                       │
   │ {                                       │
   │   "status": "error",                    │
   │   "message": "Username already taken"   │
   │ }                                       │
   └─────────────────────────────────────────┘

   ✓ ORPHAN FILE CLEANED UP
```

### Flow 5: Reset Avatar to Default

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESET AVATAR FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ DELETE /api/users/me/avatar             │
   │ (No body required)                      │
   └─────────────────────────────────────────┘
                      │
                      ▼
2. requireUser MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ ✓ User authenticated                    │
   └─────────────────────────────────────────┘
                      │
                      ▼
3. resetAvatarHandler CONTROLLER
   ┌─────────────────────────────────────────┐
   │ a) Get current user from database       │
   │                                         │
   │ b) Check if avatar is deletable:        │
   │    - Is it a custom upload?             │
   │    - Is it NOT the default avatar?      │
   │                                         │
   │ c) If deletable:                        │
   │    → Delete file from disk              │
   │                                         │
   │ d) Update database:                     │
   │    avatarUrl = '/uploads/default-avatar.png'│
   │                                         │
   │ e) Return updated user                  │
   └─────────────────────────────────────────┘
                      │
                      ▼
4. RESPONSE
   ┌─────────────────────────────────────────┐
   │ HTTP 200 OK                             │
   │ {                                       │
   │   "status": "success",                  │
   │   "data": {                             │
   │     "user": {                           │
   │       "avatarUrl": "/uploads/default-avatar.png"│
   │     }                                   │
   │   }                                     │
   │ }                                       │
   └─────────────────────────────────────────┘
```

### Flow 6: No File Uploaded (Username Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USERNAME ONLY UPDATE FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────────┐
   │ PATCH /api/users/me                     │
   │ Content-Type: application/json          │
   │                                         │
   │ { "username": "newname" }               │
   └─────────────────────────────────────────┘
                      │
                      ▼
2. upload.single('avatar') MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ No file in request                      │
   │ → req.file = undefined                  │
   │ → Continue (not an error)               │
   └─────────────────────────────────────────┘
                      │
                      ▼
3. updateUserHandler CONTROLLER
   ┌─────────────────────────────────────────┐
   │ if (req.file) ← FALSE                   │
   │ → Skip avatar processing                │
   │                                         │
   │ updateData = { username: 'newname' }    │
   │ → Only username is updated              │
   └─────────────────────────────────────────┘
                      │
                      ▼
4. RESPONSE
   ┌─────────────────────────────────────────┐
   │ HTTP 200 OK                             │
   │ {                                       │
   │   "status": "success",                  │
   │   "data": {                             │
   │     "user": {                           │
   │       "username": "newname",            │
   │       "avatarUrl": "/uploads/existing.jpg"│
   │     }                                   │
   │   }                                     │
   │ }                                       │
   └─────────────────────────────────────────┘
```

---

## Error Handling

### Error Types

| Error | Status | Cause | File Cleanup? |
|-------|--------|-------|---------------|
| Invalid file type | 400 | Non-image uploaded | Not saved |
| File too large | 400 | Exceeds 5MB limit | Partially saved (needs cleanup) |
| Username taken | 409 | Username exists | ✓ Deleted |
| Database error | 500 | DB operation failed | ✓ Deleted |
| User not found | 404 | Corrupted session | ✓ Deleted |

### Multer Error Handling (Optional Enhancement)

```typescript
// filepath: /home/salah-eddin/ft_transcendence_42/backend/src/core/middleware/multerErrorHandler.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const multerErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return next(new AppError('File too large. Maximum size is 5MB', 400));
            case 'LIMIT_FILE_COUNT':
                return next(new AppError('Too many files', 400));
            case 'LIMIT_UNEXPECTED_FILE':
                return next(new AppError('Unexpected field name', 400));
            default:
                return next(new AppError('File upload error', 400));
        }
    }
    next(err);
};
```

---

## Database Considerations

### Current Schema (Users Table)

Your current setup stores the avatar URL directly in the users table:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT DEFAULT '/uploads/default-avatar.png',
    -- other fields...
);
```

### Alternative: Separate Files Table (NOT USED)

The example code you showed initially suggested a separate `files` table:

```sql
-- THIS IS NOT IMPLEMENTED IN YOUR CURRENT SYSTEM
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploader_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);
```

### When to Use Separate Files Table?

| Scenario | Use Users.avatar_url | Use Separate Files Table |
|----------|---------------------|--------------------------|
| Just avatars | ✓ | ✗ |
| Multiple file types (docs, images) | ✗ | ✓ |
| File access control needed | ✗ | ✓ |
| Track upload history | ✗ | ✓ |
| Simple application | ✓ | ✗ |

**Your current approach is appropriate** for avatar-only uploads.

---

## Security Considerations

### Current Protections

| Protection | Implementation |
|------------|----------------|
| Authentication required | `requireUser` middleware |
| File type validation | `fileFilter` checks MIME type |
| File size limit | `limits.fileSize: 5MB` |
| Unique filenames | UUID prevents overwrites |
| Path traversal prevention | Multer handles this |

### Potential Improvements

1. **Validate file content, not just MIME type**:
```typescript
import fileType from 'file-type';

const validateFileContent = async (filePath: string): Promise<boolean> => {
    const type = await fileType.fromFile(filePath);
    return type?.mime.startsWith('image/') ?? false;
};
```

2. **Image processing** (resize, compress):
```typescript
import sharp from 'sharp';

await sharp(req.file.path)
    .resize(200, 200)
    .jpeg({ quality: 80 })
    .toFile(outputPath);
```

3. **Virus scanning** (for production):
```typescript
import NodeClam from 'clamscan';

const clamscan = await new NodeClam().init();
const { isInfected } = await clamscan.isInfected(req.file.path);
```

---

## Frontend Usage Examples

### Upload Avatar with Username

```javascript
const updateProfile = async (username, avatarFile) => {
    const formData = new FormData();
    
    if (username) {
        formData.append('username', username);
    }
    
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    
    const response = await fetch('/api/users/me', {
        method: 'PATCH',
        credentials: 'include', // Send cookies
        body: formData,
        // Don't set Content-Type - browser sets it with boundary
    });
    
    return response.json();
};

// Usage
const fileInput = document.querySelector('input[type="file"]');
await updateProfile('newusername', fileInput.files[0]);
```

### Reset Avatar

```javascript
const resetAvatar = async () => {
    const response = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
        credentials: 'include',
    });
    
    return response.json();
};
```

### Display Avatar

```html
<!-- Avatar URL is relative, served by Express static -->
<img src={user.avatarUrl} alt="User avatar" />

<!-- Resolves to -->
<img src="/uploads/550e8400-e29b-41d4-a716-446655440000.jpg" alt="User avatar" />
```

---

## Summary

| Component | File | Purpose |
|-----------|------|---------|
| Multer Config | `fileUpload.ts` | Configure storage, filters, limits |
| Controller | `controller.ts` | Handle upload logic, cleanup |
| Routes | `routes.ts` | Wire middleware and handlers |
| Static Serving | `app.ts` | Serve `/uploads` directory |

### Key Points

1. **Multer saves file BEFORE validation** - Always clean up on errors
2. **Default avatar is protected** - Never deleted from disk
3. **Old avatars are cleaned up** - Prevents orphan files
4. **Async file operations** - Non-blocking for better performance
5. **No separate files table needed** - Avatar URL stored in users table