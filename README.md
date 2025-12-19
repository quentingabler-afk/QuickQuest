# QuickQuest Backend

Authentication system for QuickQuest - The escrow-protected marketplace platform.

## 🚀 Features

- ✅ User Registration with email & password
- ✅ User Login with JWT tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation & sanitization
- ✅ Rate limiting (prevent brute force attacks)
- ✅ Security headers (Helmet)
- ✅ CORS protection
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful API design

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Create PostgreSQL Database:**

Open pgAdmin or use psql command:

```sql
CREATE DATABASE quickquest;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Edit `.env` file:**

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quickquest"
JWT_SECRET="change-this-to-a-very-long-random-string"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password
- Change `JWT_SECRET` to a long random string (use: https://randomkeygen.com/)

### 4. Run Database Migrations

Generate Prisma Client and create database tables:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes

**Base URL:** `http://localhost:5000/api`

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "isPro": false,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "isPro": false,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": null,
      "lastName": null,
      "avatar": null,
      "bio": null,
      "isPro": false,
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🔒 Security Features

1. **Password Hashing:** bcrypt with 12 salt rounds
2. **JWT Tokens:** 7-day expiration, signed with secret key
3. **Rate Limiting:** 
   - General API: 100 requests per 15 minutes
   - Auth routes: 5 attempts per 15 minutes
4. **Input Validation:** express-validator for all inputs
5. **Helmet:** Security headers enabled
6. **CORS:** Restricted to frontend URL only

## 📊 Database Schema

### Users Table

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  username   String   @unique
  password   String   // Hashed
  firstName  String?
  lastName   String?
  avatar     String?
  bio        String?
  isVerified Boolean  @default(false)
  isPro      Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🧪 Testing the API

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

**Get Profile:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman/Insomnia:

1. Import the endpoints above
2. Set `Content-Type: application/json`
3. For protected routes, add header: `Authorization: Bearer <token>`

## 🗂️ Project Structure

```
quickquest-backend/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── config/
│   │   └── database.js      # Prisma client setup
│   ├── controllers/
│   │   └── auth.controller.js   # Auth business logic
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication
│   ├── routes/
│   │   └── auth.routes.js       # Auth endpoints
│   └── utils/
│       └── jwt.js               # JWT helpers
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Express server
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Make sure PostgreSQL is running (check pgAdmin)
2. Verify DATABASE_URL in `.env` file
3. Check password is correct
4. Ensure database "quickquest" exists

### Prisma Migration Errors

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma client again
npx prisma generate
```

### Port Already in Use

**Solution:**
Change PORT in `.env` file to something else (e.g., 5001)

## 📚 Next Steps (Sprint 2)

- [ ] Task posting endpoints
- [ ] Task browsing with filters
- [ ] Escrow payment integration (Stripe)
- [ ] File upload for task submissions
- [ ] Notification system

## 🔗 Frontend Integration

Your HTML frontend should make requests to: `http://localhost:5000/api`

**Example JavaScript:**

```javascript
// Register user
async function register(email, username, password) {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
}

// Login user
async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
}

// Get current user
async function getMe() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

## 📄 License

MIT
