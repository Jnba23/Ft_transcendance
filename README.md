# ft_transcendence

*This project has been created as part of the 42 curriculum by asayad, yiken, sel-hasn, messkely, and mzouine.*

## Description

**ft_transcendence** is a full-stack web application featuring real-time multiplayer gaming, chat functionality, and comprehensive user management. The project showcases a Pong game and Rock-Paper-Scissors (RPS) game with real-time matchmaking, friend systems, OAuth authentication, and Two-Factor Authentication (2FA).

### Key Features:
- Real-time multiplayer gaming (Pong & RPS)
- Live chat system with friend management
- User authentication (OAuth 2.0 with Google & 2FA)
- Match history and ranking system
- RESTful API with comprehensive documentation
- Responsive design with modern UI/UX

---

## Team Information

### Team Structure

| Member | GitHub | Role | Responsibilities |
|--------|--------|------|------------------|
| **jnba23** | [@Jnba23](https://github.com/Jnba23) | **Project Manager** | Project planning, coordination, code reviews, RPS game implementation, feature integration |
| **yikenyiken** | [@yikenyiken](https://github.com/yikenyiken) | **Product Owner** | Requirements gathering, feature prioritization, user stories, stakeholder communication |
| **sel-hasn (Salah)** | [@sel-hasn](https://github.com/sel-hasn) | **Tech Lead** | Architecture design, authentication system, user management, API development, code quality |
| **moha (Mohamed)** | [@moha](https://github.com/moha) | **Developer** | Pong game development, real-time features, matchmaking system, game logic |
| **TheBacteria** | [@TheBacteria](https://github.com/TheBacteria) | **Developer** | Frontend development, UI/UX implementation, testing |

---

## Instructions

### Prerequisites

Ensure you have the following installed:
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development
- **npm** (v9+)
- **SSL certificates** (generated via provided script)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jnba23/ft_transcendence.git
   cd ft_transcendence
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   - `JWT_SECRET` - Secret key for JWT token generation
   - `JWT_ACCESS_EXPIRES_IN` - Access token expiration (default: 15m)
   - `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `SERVER_URL` - Backend server URL (default: http://localhost)
   - `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost)

3. **Generate SSL certificates:**
   ```bash
   ./generate-ssl.sh
   ```

### Installation & Execution

#### Using Docker (Production):
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: https://localhost
# Backend API: https://localhost/api
```

#### Local Development:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Testing

**Backend (Jest):**
```bash
cd backend
npm test
```
- Tests files with `.test.ts` extension
- Results available in GitHub Actions

**Frontend (Vite):**
```bash
cd frontend
npm run test
```

### Code Quality

- **Prettier**: Code formatting (max-len, spacing, commas, etc.)
- **ESLint**: Code quality rules (no-unused-vars, no-extra-bind, etc.)

Run formatting and linting:
```bash
npm run format
npm run lint
npm run lint:fix
```

---

## Project Management

### Work Organization

- **Task Distribution**: Features distributed based on expertise and workload balance
- **Sprint Planning**: Weekly sprints with clear goals and deliverables
- **Code Reviews**: All pull requests require at least one approval
- **Branch Strategy**: Feature branches merged into `develop`, then to `main`

### Tools Used

- **Version Control**: Git & GitHub
- **Project Management**: GitHub Projects & Issues
- **Communication**: Discord for daily standups and coordination
- **Documentation**: Markdown files and inline code documentation
- **CI/CD**: GitHub Actions for automated testing and deployment

### Branch Structure

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/user_mgmnt` - User management & authentication (sel-hasn)
- `feature/game` - Pong game implementation (moha)
- `feature/scnd_game` - RPS game implementation (jnba23)
- `feature/chat_matchmaking` - Chat & matchmaking features
- `feature/Apis-GameCust` - API development & game customization (sel-hasn)

---

## Technical Stack

### Frontend Technologies
- **React** (v19.2.4) - UI library
- **TypeScript** - Type-safe development
- **Vite** (v5.0.0) - Build tool and dev server
- **Zustand** - State management
- **Socket.io-client** - Real-time communication
- **Axios** (v1.5.0) - HTTP client
- **CSS3** - Styling

**Justification**: React with TypeScript provides type safety and component reusability. Vite offers fast HMR and optimal build performance. Zustand was chosen for its simplicity and minimal boilerplate compared to Redux.

### Backend Technologies
- **Node.js** (v18+) - Runtime environment
- **Express** (v5.2.1) - Web framework
- **TypeScript** - Type-safe development
- **Socket.io** (v4.8.3) - WebSocket implementation
- **Passport.js** (v0.7.0) - Authentication middleware
- **bcrypt** (v6.0.0) - Password hashing
- **jsonwebtoken** (v9.0.3) - JWT tokens
- **Zod** - Schema validation
- **@scalar/hono** - API documentation

**Justification**: Express provides a robust and flexible web framework. Socket.io enables reliable real-time bidirectional communication. TypeScript ensures type safety across the entire backend. Passport.js simplifies OAuth integration.

### Database System
- **SQLite3** - Lightweight SQL database

**Justification**: SQLite was chosen for its:
- Zero configuration and easy deployment
- Single-file database simplifying backups
- Sufficient performance for the project scale
- ACID compliance for data integrity
- Perfect for development and small-to-medium production loads

### Additional Technologies
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and static file serving
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting
- **OpenAPI/Scalar** - API documentation

---

## Database Schema

### Visual Representation

The database uses SQLite3 with the following structure:

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ google_id       │
│ avatar_url      │
│ level           │
│ is_2fa_enabled  │
│ two_fa_secret   │
│ status          │
│ pong_wins       │
│ pong_losses     │
│ RPS_wins        │
│ RPS_losses      │
│ created_at      │
└─────────────────┘
         │
         ├──────┐
         │      │
         ▼      ▼
┌─────────────────┐
│   friendship    │
├─────────────────┤
│ id (PK)         │
│ user_id_1 (FK)  │
│ user_id_2 (FK)  │
│ status          │
│ created_at      │
└─────────────────┘

         │
         ▼
┌─────────────────┐
│     games       │
├─────────────────┤
│ id (PK)         │
│ player1_id (FK) │
│ player2_id (FK) │
│ winner_id (FK)  │
│ player1_score   │
│ player2_score   │
│ game_type       │
│ status          │
│ created_at      │
└─────────────────┘

         │
         ▼
┌─────────────────┐
│ conversations   │
├─────────────────┤
│ id (PK)         │
│ user_id_1 (FK)  │
│ user_id_2 (FK)  │
│ created_at      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    messages     │
├─────────────────┤
│ id (PK)         │
│ conversation_id │
│ sender_id (FK)  │
│ content         │
│ sent_at         │
│ is_read         │
└─────────────────┘
```

### Tables and Relationships

**users**
- Primary table storing user information
- Fields: authentication data, OAuth info, avatar, stats, 2FA settings
- Relationships: One-to-many with games, friendships, messages

**friendship**
- Manages friend connections between users
- Status: 'pending' or 'accepted'
- Prevents duplicate friendships and self-friending

**games**
- Records all played games (Pong & RPS)
- Tracks scores, winners, and game type
- Links to users table for players

**conversations & messages**
- Implements one-on-one chat system
- Messages linked to conversations between two users
- Tracks read status and timestamps

**token_blacklist**
- Stores invalidated JWT tokens for logout
- Auto-cleanup of expired tokens

---

## Modules

### Implemented Modules (42 Project Requirements)

#### **Major Modules (2 points each)**

1. **Use a Framework for Backend** ✅
   - **Points**: 2
   - **Implementation**: Express.js (v5.2.1) framework
   - **Justification**: Express provides robust routing, middleware support, and extensive ecosystem
   - **Team Members**: sel-hasn (architecture), moha (game APIs), jnba23 (RPS integration)

2. **Implement Real-Time Features Using WebSockets** ✅
   - **Points**: 2
   - **Implementation**: Socket.io (v4.8.3) for bidirectional real-time communication
   - **Features**:
     - Real-time game state synchronization
     - Live matchmaking
     - Instant chat messaging
     - Connection/disconnection handling
     - Efficient message broadcasting
   - **Team Members**: moha (Pong game sockets), jnba23 (RPS game sockets), sel-hasn (chat sockets)

3. **Allow Users to Interact with Other Users** ✅
   - **Points**: 2
   - **Implementation**:
     - **Chat System**: Send/receive messages between users
     - **Profile System**: View user information, stats, match history
     - **Friends System**: Add/remove friends, see friends list
   - **Team Members**: sel-hasn (backend implementation), TheBacteria (frontend UI)

4. **A Public API with Secured Endpoints** ✅
   - **Points**: 2
   - **Implementation**: RESTful API with JWT authentication, rate limiting, and OpenAPI documentation
   - **Endpoints** (5+ required):
     - `GET /api/users` - List users
     - `POST /api/auth/login` - User login
     - `PUT /api/users/profile` - Update profile
     - `DELETE /api/friends/:id` - Remove friend
     - `GET /api/games/history` - Game history
     - Plus 20+ additional endpoints
   - **Team Members**: sel-hasn (API design & implementation)

5. **Standard User Management and Authentication** ✅
   - **Points**: 2 (Major module from User Management section)
   - **Implementation**:
     - Update profile information
     - Upload avatar (with default if none provided)
     - Add users as friends and see online status
     - Profile page displaying user information
   - **Team Members**: sel-hasn (backend), TheBacteria (frontend)

6. **Implement a Complete Web-Based Game** ✅
   - **Points**: 2
   - **Implementation**: Pong - Real-time multiplayer game
   - **Features**:
     - Real-time gameplay between two players
     - Live match functionality
     - Clear rules and win/loss conditions
     - 2D graphics
   - **Team Members**: moha (game engine, physics, UI)

7. **Remote Players — Enable Two Players on Separate Computers** ✅
   - **Points**: 2
   - **Implementation**: 
     - WebSocket-based real-time synchronization
     - Handle network latency and disconnections gracefully
     - Smooth user experience for remote gameplay
     - Reconnection logic
   - **Team Members**: moha (Pong), jnba23 (RPS)

8. **Add Another Game with User History and Matchmaking** ✅
   - **Points**: 2
   - **Implementation**: Rock-Paper-Scissors (RPS) as second game
   - **Features**:
     - Distinct gameplay from Pong
     - Track user history and statistics
     - Matchmaking system for finding opponents
     - Performance optimization
   - **Team Members**: jnba23 (RPS game implementation & matchmaking)

#### **Minor Modules (1 point each)**

1. **Use a Frontend Framework** ✅
   - **Points**: 1
   - **Implementation**: React (v19.2.4) with TypeScript
   - **Team Members**: All team members (component development)

2. **Use a Backend Framework** ✅
   - **Points**: 1
   - **Implementation**: Express.js (v5.2.1) with TypeScript
   - **Team Members**: sel-hasn, moha, jnba23

3. **Use ORM for Database** ✅
   - **Points**: 1
   - **Implementation**: Custom database client with type-safe query builders
   - **Team Members**: sel-hasn

4. **Implement Remote Authentication with OAuth 2.0** ✅
   - **Points**: 1
   - **Implementation**: Google OAuth 2.0 integration using Passport.js
   - **Team Members**: sel-hasn

5. **Implement a Complete 2FA System** ✅
   - **Points**: 1
   - **Implementation**: Two-Factor Authentication using TOTP (Time-based One-Time Password)
   - **Team Members**: sel-hasn

6. **Game Statistics and Match History** ✅
   - **Points**: 1
   - **Implementation**:
     - Track user game statistics (wins, losses, ranking, level)
     - Display match history (1v1 games, dates, results, opponents)
     - Show achievements and progression
     - Leaderboard integration
   - **Team Members**: moha (Pong stats), jnba23 (RPS stats), sel-hasn (database)

### **Total Points: 19 points**
- **Major Modules**: 8 × 2 = 16 points
- **Minor Modules**: 6 × 1 = 6 points (only counting distinct modules)
- **Adjusted Total**: 19 points (exceeds minimum requirement)

---

## Features List

### Authentication & Authorization
- User registration and login
- OAuth 2.0 authentication (Google)
- Two-Factor Authentication (2FA/TOTP)
- JWT-based session management
- Password hashing with bcrypt
- Secure logout with token blacklisting
- **Team Members**: sel-hasn

### User Management
- User profiles with customizable avatars
- User search functionality
- Online/offline status tracking
- Profile information display
- User statistics and rankings
- Level system (ELO-based)
- **Team Members**: sel-hasn (backend), TheBacteria (frontend)

### Friends System
- Send/accept/decline friend requests
- Friends list with online status
- Remove friends
- Friend-only chat
- **Team Members**: sel-hasn

### Pong Game
- Real-time multiplayer Pong
- Paddle controls with smooth movement
- Ball physics and collision detection
- Score tracking
- Win/loss conditions (first to 7 points)
- Game state synchronization
- Matchmaking system
- **Team Members**: moha

### Rock-Paper-Scissors (RPS) Game
- Real-time multiplayer RPS
- Best-of-5 rounds system
- Choice submission and reveal
- Win/draw/loss determination
- Match history tracking
- Statistics recording
- **Team Members**: jnba23

### Matchmaking
- Automatic opponent matching
- Queue system for waiting players
- Skill-based pairing
- Game type selection (Pong/RPS)
- Real-time status updates
- **Team Members**: moha (Pong), jnba23 (RPS)

### Chat System
- One-on-one messaging
- Real-time message delivery
- Read receipts
- Conversation history
- Message persistence
- **Team Members**: sel-hasn (backend), TheBacteria (frontend)

### Game History & Statistics
- Match history for both games
- Win/loss records
- Score tracking
- Opponent information
- Game timestamps
- Performance metrics
- **Team Members**: moha, jnba23, sel-hasn

### RESTful API
- Comprehensive REST API with 25+ endpoints
- JWT authentication for secure endpoints
- Request validation with Zod schemas
- Error handling middleware
- OpenAPI/Scalar documentation
- Rate limiting
- **Team Members**: sel-hasn

### UI/UX
- Responsive design
- Modern interface
- Real-time updates
- Loading states and error handling
- Smooth animations
- Intuitive navigation
- **Team Members**: TheBacteria, moha, jnba23

---

## Individual Contributions

### jnba23 (Project Manager)
**Primary Focus**: Project coordination, RPS game implementation, integration

**Key Contributions**:
- Project planning and timeline management
- Rock-Paper-Scissors game implementation
  - RPS game engine and logic
  - Socket.io event handlers for RPS
  - Frontend RPS game component
  - Matchmaking integration for RPS
- Zustand state management setup
- Feature integration and testing
- Code reviews and pull request management
- Frontend-backend communication for games
- Bug fixes and optimization

**Challenges Overcome**:
- Synchronizing game state between multiple clients
- Handling disconnections gracefully in real-time games
- Integrating two different games with unified matchmaking system

**Branches**: `feature/scnd_game`, project coordination across all branches

---

### yikenyiken (Product Owner)
**Primary Focus**: Project requirements, user stories, feature prioritization

**Key Contributions**:
- Requirements gathering and documentation
- Feature prioritization based on 42 curriculum requirements
- User story creation and acceptance criteria
- Stakeholder communication
- Sprint planning and backlog management
- Testing and quality assurance
- Module selection strategy to maximize points
- Repository structure and initial setup

**Challenges Overcome**:
- Balancing feature complexity with timeline constraints
- Ensuring all mandatory modules were implemented
- Coordinating between technical and project requirements

---

### sel-hasn (Salah - Tech Lead)
**Primary Focus**: Architecture, authentication, user management, API development

**Key Contributions**:
- System architecture design
- Authentication system implementation
  - JWT-based authentication
  - OAuth 2.0 integration (Google)
  - Two-Factor Authentication (2FA/TOTP)
  - Session management and token refresh
  - Password hashing and security
- User management system
  - User profiles and avatars
  - User search functionality
  - Status tracking (online/offline)
  - User statistics
- Friends system implementation
  - Friend requests
  - Friend list management
  - Friendship status tracking
- RESTful API development
  - 25+ endpoints across auth, users, friends, games, chat
  - Request validation with Zod
  - Error handling middleware
  - API documentation with OpenAPI/Scalar
- Database design and implementation
  - Schema design (SQLite3)
  - Custom database client
  - Relationships and constraints
- Chat system backend
  - WebSocket handlers
  - Message persistence
  - Conversation management
- Code quality setup
  - ESLint and Prettier configuration
  - TypeScript configuration
  - Testing framework setup
- Service worker for API proxying
- Cross-tab authentication synchronization

**Challenges Overcome**:
- Implementing secure OAuth 2.0 flow with proper token handling
- Building a custom database client with type safety
- Managing authentication state across multiple tabs
- Handling token refresh without disrupting user experience
- Resolving ESLint/Prettier configuration conflicts

**Branches**: `feature/user_mgmnt`, `feature/Apis-GameCust`

---

### moha (Mohamed - Developer)
**Primary Focus**: Pong game development, real-time features

**Key Contributions**:
- Pong game implementation
  - Game engine and physics
  - Ball collision detection
  - Paddle movement synchronization
  - Score tracking system
  - Win/loss conditions
- Real-time game features
  - Socket.io event handlers for Pong
  - Game state synchronization
  - Client-server communication
  - Latency handling
- Matchmaking system
  - Queue management
  - Player pairing algorithm
  - Match creation and initialization
- Game UI development
  - Canvas rendering
  - Game controls
  - Score display
  - Match results screen
- Ranking system implementation
- Frontend-backend integration for games
- Performance optimization for real-time gameplay

**Challenges Overcome**:
- Synchronizing paddle positions with minimal latency
- Handling connection drops during active matches
- Implementing fair matchmaking algorithm
- Resolving "Next Match" button behavior issues
- Optimizing canvas rendering performance

**Branches**: `feature/game`

---

### TheBacteria (Developer)
**Primary Focus**: Frontend development, UI/UX implementation

**Key Contributions**:
- Frontend component development
- User interface design and implementation
- Responsive layout design
- Authentication pages (login, register)
- Profile pages and user information display
- Chat interface
- Dashboard and navigation
- Settings page
- Form validation and error handling
- Integration with backend APIs
- User experience optimization

**Challenges Overcome**:
- Creating responsive designs for various screen sizes
- Implementing real-time updates in the UI
- Managing complex state in React components
- Ensuring consistent styling across the application

**Branches**: Contributions across `develop` and feature branches

---

## Resources

### Classic References

**React & TypeScript:**
- [React Official Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

**Node.js & Express:**
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

**WebSockets & Real-Time:**
- [Socket.io Documentation](https://socket.io/docs/)
- [WebSocket Protocol (RFC 6455)](https://tools.ietf.org/html/rfc6455)

**Authentication & Security:**
- [Passport.js Documentation](http://www.passportjs.org/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)

**Database:**
- [SQLite Documentation](https://www.sqlite.org/docs.html)

**Docker:**
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

**Game Development:**
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

### AI Usage

AI tools were used throughout the project to assist with:

1. **Code Generation**:
   - Boilerplate code for Express routes and controllers
   - TypeScript type definitions and interfaces
   - Socket.io event handlers structure
   - React component scaffolding

2. **Debugging**:
   - Identifying and fixing TypeScript compilation errors
   - Resolving Socket.io connection issues
   - Debugging real-time synchronization problems
   - ESLint and Prettier configuration conflicts

3. **Documentation**:
   - API endpoint documentation
   - Code comments for complex logic
   - README structure and formatting
   - Database schema explanations

4. **Problem Solving**:
   - OAuth 2.0 implementation guidance
   - 2FA/TOTP integration strategies
   - WebSocket connection handling patterns
   - Database query optimization

5. **Code Review**:
   - Identifying potential bugs and edge cases
   - Security vulnerability detection
   - Performance optimization suggestions
   - Best practices recommendations

**Tools Used**:
- GitHub Copilot for code completion
- ChatGPT for problem-solving and documentation
- AI-assisted debugging tools

**Note**: All AI-generated code was reviewed, tested, and modified by team members to ensure quality, security, and alignment with project requirements.

---

## License

This project is part of the 42 curriculum and is for educational purposes only.

---

## Acknowledgments

- 42 Network for the project requirements and guidance
- The open-source community for the excellent tools and libraries
- All team members for their dedication and hard work
