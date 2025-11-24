# Frontend Architecture Explained

## Think of Your Frontend Like a Store

Your frontend is like a **physical store**:

```
Customer (User browsing)
    ↓
    └─→ Pages (Different sections: Login, Games, Chat)
        └─→ Components (Buttons, Cards, Forms)
            └─→ Hooks (Get data from API or state)
                └─→ API (Ask backend for data)
                    └─→ Backend Server (Gets actual data)
```

Illustration using **the Login feature**

---

## The Flow: User Logs In

```
1. User sees LoginPage component
                ↓
2. User types email & password, clicks "Login"
                ↓
3. Page calls API: authAPI.login(email, password)
                ↓
4. API makes HTTP request to backend
                ↓
5. Backend responds: { token: "xyz123", user: {...} }
                ↓
6. Hook (useAuth) stores token and user in Context
                ↓
7. Page redirects to Dashboard
```

Now let's look at each file:

---

## Layer 1: PAGES (What User Sees)

**File: `frontend/src/pages/auth/LoginPage.tsx`**

- Email input field
- Password input field
- Login button
- Loading state
- Error messages

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import styles from './styles.module.css';

export function LoginPage() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get auth functions from context
  const { login } = useAuth();
  
  // Navigate after login
  const navigate = useNavigate();

  // When user clicks "Login"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Call API
      const response = await authAPI.login(email, password);

      // 2. Save to context
      login(response.data.token, response.data.user);

      // 3. Redirect
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}
```
---

## Layer 2: COMPONENTS (Reusable UI)

**File: `frontend/src/components/common/Input.tsx`**

This is like **store fixtures** - used everywhere:

```typescript
import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function Input({
  type,
  placeholder,
  value,
  onChange,
  error
}: InputProps) {
  return (
    <div className={styles.wrapper}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={error ? styles.error : ''}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
```

**Usage in LoginPage:**
```typescript
<Input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**File: `frontend/src/components/common/Button.tsx`**

```typescript
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={styles[variant]}
    >
      {children}
    </button>
  );
}
```

**Simple analogy:** Components are **lego blocks**:
- Everyone uses them
- Don't duplicate!
---

## Layer 3: HOOKS (Get Data)

**File: `frontend/src/hooks/useAuth.ts`**

This is the **delivery service**. It gets data from the API:

```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  // Get auth state from context
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
```

**File: `frontend/src/hooks/useFetch.ts`**

Generic hook for fetching any data:

```typescript
import { useState, useEffect } from 'react';

export function useFetch<T>(
  fetchFn: () => Promise<{ data: T }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Call the API
        const response = await fetchFn();
        
        // 2. Save the data
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, dependencies);

  return { data, loading, error };
}
```

**Usage in a component:**
```typescript
// Get user's RPS stats
const { data: stats, loading, error } = useFetch(
  () => rpsAPI.getStats(),
  []  // Run once on mount
);

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;
return <div>Stats: {stats.wins} wins</div>;
```

**File: `frontend/src/hooks/useGame.ts`**

Specific hook for game state:

```typescript
import { useState, useCallback } from 'react';
import { gameAPI } from '../api/game';

export function useGame() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  const startGame = useCallback(async (opponentId: string) => {
    setLoading(true);
    try {
      const response = await gameAPI.startGame(opponentId);
      setGameState(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const makeMove = useCallback(async (gameId: string, move: string) => {
    const response = await gameAPI.makeMove(gameId, move);
    setGameState(response.data);
  }, []);

  return { gameState, loading, startGame, makeMove };
}
```

**Usage in GamePage:**
```typescript
const { gameState, startGame, makeMove } = useGame();

const handleStart = () => startGame(opponent.id);
const handleMove = (move: string) => makeMove(gameState.id, move);
```

**Simple analogy:** Hooks are **delivery drivers**:
- Driver gets data from backend
- Returns data to page
- Page updates automatically
---

## Layer 4: CONTEXT (Shared State)

**File: `frontend/src/context/AuthContext.tsx`**

This is the **store manager** keeping track of current user:

```typescript
import React, { createContext, useState, useCallback } from 'react';

// What shape is the auth state?
interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = useCallback((newToken: string, newUser: any) => {
    // 1. Save to state
    setToken(newToken);
    setUser(newUser);

    // 2. Save to localStorage (persists after refresh)
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    // 1. Clear state
    setToken(null);
    setUser(null);

    // 2. Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!token,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Usage in App.tsx:**
```typescript
import { AuthProvider } from './context/AuthContext';

export function App() {
  return (
    <AuthProvider>
      <Router>
        {/* All pages have access to auth context */}
      </Router>
    </AuthProvider>
  );
}
```

**Simple analogy:** Context is like **the store's central database**:
- Everyone can read: "Is user logged in?"
- Everyone can write: "User logged in!"
- Change happens everywhere automatically

---

## Layer 5: API (Talk to Backend)

**File: `frontend/src/api/auth.ts`**

```typescript
import { client } from './client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export const authAPI = {
  // Send login request
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', {
      email,
      password
    }),

  // Send register request
  register: (email: string, password: string, username: string) =>
    client.post<LoginResponse>('/auth/register', {
      email,
      password,
      username
    }),

  // Send logout request
  logout: () =>
    client.post('/auth/logout'),

  // Get current user
  getCurrentUser: () =>
    client.get('/auth/me')
};
```

**File: `frontend/src/api/rps.ts`**

```typescript
import { client } from './client';

interface RPSMove {
  move: 'rock' | 'paper' | 'scissors';
}

interface RPSResult {
  winner: 'player1' | 'player2' | 'tie';
  player1Move: string;
  player2Move: string;
}

interface RPSStats {
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
}

export const rpsAPI = {
  // Play RPS game
  play: (move: string) =>
    client.post<RPSResult>('/rps/play', { move }),

  // Get RPS statistics
  getStats: () =>
    client.get<RPSStats>('/rps/stats'),

  // Get RPS history
  getHistory: () =>
    client.get('/rps/history')
};
```

**File: `frontend/src/api/client.ts`**

Setup HTTP client (Axios or Fetch):

```typescript
import axios from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Simple analogy:** API is **writing a letter**:
- "here's what I want: /rps/play"
- Backend reads it
- Backend sends back response
- "Here's your result"

---

## Layer 6: TYPES (Data Structure)

**File: `frontend/src/types/auth.ts`**

Define TypeScript types:

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
```

**File: `frontend/src/types/game.ts`**

```typescript
export interface Game {
  id: string;
  player1: User;
  player2: User;
  status: 'waiting' | 'playing' | 'finished';
  winner?: User;
  moves: GameMove[];
  createdAt: string;
}

export interface GameMove {
  playerId: string;
  move: string;
  timestamp: string;
}

export type GameType = 'standard' | 'rps';
```

**Simple analogy:** Types are **blueprint**:
- "A User always looks like this"
- "A Game always looks like this"
- TypeScript checks automatically!
---

## Why This Pattern?

✅ **Pages** - Know what user sees
✅ **Components** - Reuse UI everywhere
✅ **Hooks** - Get data automatically
✅ **Context** - Share state globally
✅ **API** - Centralized backend calls
✅ **Types** - TypeScript ensures correctness

Each layer has **ONE JOB**:
- **Change page layout?** Edit Pages
- **Fix button style?** Edit Components
- **Change API call?** Edit API
- **Add new user state?** Edit Context

---

## Quick Comparison

| Layer | Job | Example |
|-------|-----|---------|
| Pages | WHAT user sees | LoginPage.tsx |
| Components | REUSABLE UI | Button.tsx, Input.tsx |
| Hooks | GET data | useAuth(), useFetch() |
| Context | SHARED state | AuthContext |
| API | TALK to backend | authAPI.login() |
| Types | DATA shape | User interface |