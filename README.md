# Taskflow: MERN Task Management System

React dashboard + Express/Node REST API + MongoDB. JWT authentication with bcrypt-hashed passwords.

## Run locally
```bash
# API
cd server && cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install && npm run dev          # http://localhost:5000

# Frontend (new terminal)
cd client && cp .env.example .env
npm install && npm run dev          # http://localhost:5173
```

## Database schema (MongoDB / Mongoose)
**users**: `name` String (required), `email` String (required, unique, lowercase), `password` String (bcrypt hash, `select:false`), `createdAt`, `updatedAt`

**tasks**: `user` ObjectId → users (required, indexed), `title` String (required, max 120), `description` String (max 1000), `status` `todo | in-progress | done` (default `todo`), `priority` `low | medium | high` (default `medium`), `deadline` Date, `createdAt`, `updatedAt`

Relationship: one user has many tasks. Every task query is scoped to `req.userId`, so users only see their own data.

## REST API
Base URL: `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Body `{name, email, password}` → `201 {token, user}` |
| POST | `/auth/login` | No | Body `{email, password}` → `{token, user}` |
| GET | `/auth/me` | Yes | Current user |
| GET | `/tasks` | Yes | List tasks. Query: `status`, `priority`, `search`, `overdue=true`, `sort` (`deadline` or `-createdAt`) |
| POST | `/tasks` | Yes | Body `{title, description?, status?, priority?, deadline?}` → `201` task |
| GET | `/tasks/:id` | Yes | One task |
| PUT | `/tasks/:id` | Yes | Update any task fields (also used for status changes) |
| DELETE | `/tasks/:id` | Yes | Delete task |

Errors return `{ "message": "..." }` with status 400 (validation), 401 (auth), 404 (not found), 409 (duplicate email).

## Test the API
```bash
API=http://localhost:5000/api
TOKEN=$(curl -s -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@test.com","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -X POST $API/tasks -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Write report","priority":"high","deadline":"2026-11-01"}'
curl "$API/tasks?status=todo&sort=deadline" -H "Authorization: Bearer $TOKEN"
```

## Deployment
1. **Database**: create a free MongoDB Atlas cluster, allow network access, copy the connection string.
2. **API on Render**: New Web Service → root `server`, build `npm install`, start `npm start`. Env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL).
3. **Frontend on Vercel/Netlify**: root `client`, build `npm run build`, output `dist`. Env var: `VITE_API_URL=https://<your-api>.onrender.com/api`.
4. Open the live site, register, and confirm tasks persist after a refresh.

## Deliverables checklist
- [ ] GitHub repo: `git init && git add . && git commit -m "Taskflow" ` then push
- [ ] Deployment links (frontend + API) added here
- [ ] Screenshots saved in `/screenshots`: login, dashboard, filters, edit form
