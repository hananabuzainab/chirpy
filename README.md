# Chirpy API 🐦

A RESTful backend API for a social media platform that allows users to create, manage, and interact with short messages called **chirps**.

This project demonstrates backend development concepts including authentication, authorization, database management, API design, and secure user sessions.

---

## 🚀 Features

* User registration and login
* Secure password hashing using Argon2
* JWT-based authentication
* Refresh token authentication system
* User authorization
* Create, read, and delete chirps
* Update user profile information
* Chirp filtering and sorting
* Webhook integration for membership upgrades
* API key authentication for external services
* PostgreSQL database integration
* Database migrations using Drizzle ORM

---

## 🛠️ Technologies Used

* **TypeScript**
* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Drizzle ORM**
* **JWT (JSON Web Tokens)**
* **Argon2 Password Hashing**
* **Vitest**
* **dotenv Environment Variables**

---

## 📂 Project Structure

```
chirpy/
│
├── src/
│   ├── db/
│   │   ├── schema.ts
│   │   └── queries/
│   │
│   ├── auth.ts
│   ├── config.ts
│   ├── errors.ts
│   └── index.ts
│
├── package.json
├── drizzle.config.ts
├── .env
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/your-username/chirpy.git

cd chirpy
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file:

```
DB_URL=your_postgresql_database_url

JWT_SECRET=your_jwt_secret

POLKA_KEY=your_api_key

PLATFORM=dev
```

---

## 4. Run database migrations

```bash
npm run migrate
```

---

## 5. Start the development server

```bash
npm run dev
```

The server will run on:

```
http://localhost:8080
```

---

# 🔐 Authentication

Chirpy uses JWT authentication.

## Login Flow

1. User sends email and password.
2. Server verifies credentials.
3. Server returns:

   * Access Token (JWT)
   * Refresh Token

Example response:

```json
{
  "email": "user@example.com",
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

Protected endpoints require:

```
Authorization: Bearer <token>
```

---

# 📌 API Endpoints

## Users

### Create User

```
POST /api/users
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Login

```
POST /api/login
```

---

### Update User

```
PUT /api/users
```

Requires authentication.

---

# 🐦 Chirps

## Create Chirp

```
POST /api/chirps
```

Requires JWT authentication.

---

## Get Chirps

```
GET /api/chirps
```

Optional query parameters:

### Filter by author

```
GET /api/chirps?authorId=<userId>
```

### Sort results

Ascending:

```
GET /api/chirps?sort=asc
```

Descending:

```
GET /api/chirps?sort=desc
```

---

## Delete Chirp

```
DELETE /api/chirps/:chirpId
```

Only the chirp owner can delete it.

---

# 🔄 Refresh Tokens

Refresh access tokens using:

```
POST /api/refresh
```

Revoke refresh tokens:

```
POST /api/revoke
```

---

# 🔗 Webhooks

Chirpy integrates with external services using webhooks.

Example:

```
POST /api/polka/webhooks
```

Used to upgrade users to Chirpy Red membership.

Webhook requests are protected using API key authentication.

---

# 🧪 Testing

Run tests:

```bash
npm test
```

---

# 📚 What I Learned

Through this project, I practiced:

* Building REST APIs with Express
* Designing database schemas
* Working with PostgreSQL
* Implementing authentication systems
* Managing JWT and refresh tokens
* Applying authorization rules
* Handling webhooks
* Writing clean backend architecture

---

# 👩‍💻 Author

Hanan Abu Zainab

Computer Systems Engineering Student

GitHub:
https://github.com/hananabuzainab
