# MyDomains - Project Structure

## Overview
This document describes the project structure after refactoring.

## Directory Structure

```
mydomains/
├── public/                      # Static files
├── server/                      # Backend application
│   ├── config/
│   │   └── config.js           # Application configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── domainController.js # Domain management logic
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   └── domains.js          # Domain routes
│   ├── validators/
│   │   └── validators.js       # Input validation
│   ├── database.js             # SQLite database setup
│   ├── server.js               # Main server file
│   └── package.json            # Backend dependencies
├── src/                         # Frontend application
│   ├── components/              # React components
│   │   ├── AddDomainModal.js
│   │   ├── AuthPage.js
│   │   ├── ContactSection.js
│   │   ├── DetailedDashboard.js
│   │   ├── EmptyState.js
│   │   ├── ExternalTools.js
│   │   ├── PasswordStrengthMeter.js
│   │   ├── SimpleCard.js
│   │   ├── UserDropdown.js
│   │   └── index.js            # Barrel exports
│   ├── config/
│   │   ├── api.js              # API endpoints configuration
│   │   └── constants.js        # Application constants
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useDomains.js       # Domain management hook
│   │   └── useTheme.js         # Theme management hook
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── utils/
│   │   └── helpers.js          # Utility functions
│   ├── App.css                 # Application styles
│   ├── App.js                  # Main application component
│   ├── index.css               # Global styles
│   └── index.js                # Application entry point
├── .env                         # Environment variables
├── .gitignore
├── package.json                 # Frontend dependencies
├── PROJECT_STRUCTURE.md         # This file
└── REFACTORING_SUMMARY.md       # Refactoring documentation
```

## Component Descriptions

### Frontend Components

#### `App.js`
Main application component that orchestrates the entire frontend application.
- Uses custom hooks for state management
- Handles routing between authenticated and unauthenticated views
- Manages domain selection and modal state

#### Components

##### `AuthPage.js`
Authentication page component for login and registration.
- Handles both login and registration flows
- Form validation
- Password strength indicator
- Theme toggle

##### `UserDropdown.js`
User profile dropdown in the navigation bar.
- Displays user information
- Logout functionality

##### `EmptyState.js`
Empty state component shown when no domains are added.
- Call-to-action to add first domain

##### `SimpleCard.js`
Domain card displayed in grid view.
- Shows domain summary information
- View details button

##### `DetailedDashboard.js`
Detailed view of a single domain.
- Complete WHOIS information
- Contact sections
- Name servers
- Domain status

##### `AddDomainModal.js`
Modal for adding new domains.
- Supports bulk domain addition (up to 5)
- Progress tracking
- WHOIS lookup integration

##### `ContactSection.js`
Reusable component for displaying contact information.
- Used for registrant, admin, and technical contacts

##### `PasswordStrengthMeter.js`
Visual indicator of password strength.

##### `ExternalTools.js`
Sidebar component showing external security tools.

### Custom Hooks

#### `useAuth()`
Manages authentication state and operations.
- Returns: `{ isAuthenticated, currentUser, loading, login, register, logout }`
- Handles JWT token storage
- Manages user session

#### `useTheme()`
Manages application theme (dark/light mode).
- Returns: `{ darkMode, toggleTheme, setDarkMode }`
- Persists theme preference in localStorage
- Updates document attributes

#### `useDomains()`
Manages domain state and operations.
- Returns: `{ domains, loading, error, fetchDomains, addDomain, removeDomain, setDomains }`
- Fetches domains from API
- Manages domain list state

### Services

#### `api.js`
Centralized API service layer.
- `authService`: Login, register, logout
- `domainService`: CRUD operations for domains
- Handles authentication headers
- Error handling

### Backend Structure

#### Controllers

##### `authController.js`
Handles authentication logic.
- `register`: Create new user account
- `login`: Authenticate existing user
- Password hashing with bcrypt
- JWT token generation

##### `domainController.js`
Handles domain operations.
- `getAllDomains`: Get user's domains
- `createDomain`: Add new domain
- `deleteDomain`: Remove domain
- `getWhoisInfo`: Fetch WHOIS data from Whoxy API

#### Routes

##### `auth.js`
Authentication routes.
- `POST /api/register`: User registration
- `POST /api/login`: User login

##### `domains.js`
Domain management routes.
- `GET /api/domains`: Get all domains
- `POST /api/domains`: Create domain
- `DELETE /api/domains/:id`: Delete domain
- `GET /api/whois/:domain`: Get WHOIS info

#### Middleware

##### `auth.js`
JWT authentication middleware.
- Validates JWT tokens
- Attaches user info to request

#### Validators

##### `validators.js`
Input validation functions.
- Email format validation
- Password strength validation
- Domain format validation
- Request body validation

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Domains
- `GET /api/domains` - Get all user domains (requires auth)
- `POST /api/domains` - Add new domain (requires auth)
- `DELETE /api/domains/:id` - Delete domain (requires auth)
- `GET /api/whois/:domain` - Get WHOIS information

### Health Check
- `GET /health` - Server health status

## Environment Variables

### Backend (.env)
```
PORT=5000
WHOXY_API_KEY=your_api_key_here
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend
```
REACT_APP_API_URL=http://localhost:5000
```

## Setup Instructions

### Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Running the Application

#### Development Mode
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
npm start
```

#### Production Build
```bash
# Build frontend
npm run build

# Serve with backend
cd server
NODE_ENV=production npm start
```

## Testing
```bash
# Frontend tests
npm test

# Backend tests (if implemented)
cd server
npm test
```

## Code Style
- ES6+ JavaScript
- Functional React components
- React Hooks for state management
- Express.js for backend
- SQLite for database

## Best Practices Followed
1. **Separation of Concerns**: Each file has a single responsibility
2. **DRY (Don't Repeat Yourself)**: Reusable components and hooks
3. **Component Composition**: Small, focused components
4. **Custom Hooks**: Shared logic extracted into hooks
5. **Service Layer**: API calls centralized
6. **Input Validation**: All endpoints validate input
7. **Error Handling**: Consistent error handling
8. **Configuration**: Environment-based configuration
9. **Security**: JWT authentication, password hashing

## Future Enhancements
1. TypeScript migration
2. Unit and integration tests
3. API rate limiting
4. Caching layer
5. Real-time updates with WebSockets
6. Domain monitoring and alerts
7. Bulk operations
8. Export functionality
9. Advanced filtering and search
10. Mobile responsive improvements
