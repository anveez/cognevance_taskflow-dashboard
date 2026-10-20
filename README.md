# TaskFlow — MERN Task Management System

A full-stack task management application built with the MERN stack. TaskFlow enables users to securely register, manage their tasks, set priorities and deadlines, and track progress through a dashboard.

## 🚀 Live Deployment

- **Frontend:** https://cognevance-taskflow-dashboard.vercel.app
- **Backend Health Check:** https://cognevance-taskflow-dashboard1.vercel.app/api/health
- **GitHub Repository:** https://github.com/anveez/cognevancetaskflow-dashboard

## ✨ Features

- User registration and login with JWT authentication
- Password hashing using bcrypt
- Create, view, update, and delete tasks (CRUD)
- Task status and priority management
- Deadline tracking and overdue task filtering
- Search and filter tasks
- Protected REST API endpoints
- MongoDB persistence
- User-specific task access
- Deployed frontend and backend

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Deployment | Vercel |
| Version Control | Git, GitHub |

## 📸 Screenshots

Add your screenshots to the `screenshots/` folder in this repository.

Suggested screenshots:
- Login and registration page
- Main task dashboard
- Task creation or editing form
- Task filters and task statuses

After uploading the images, display them here using their actual filenames. For example:

```markdown
![TaskFlow Dashboard](screenshots/dashboard.png)
```

## 🏗️ Project Structure

```text
taskflow/
├── client/
│   └── src/
│       ├── api.js
│       └── ...
├── server/
│   ├── api/
│   │   └── index.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── vercel.json
└── README.md
```

## ⚙️ Run Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/anveez/cognevancetaskflow-dashboard.git
cd cognevancetaskflow-dashboard
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:5173.

**Security:** Never commit `.env` files or expose database credentials or JWT secrets.

## 🗄️ Database Schema

### Users

- `name`: String, required
- `email`: String, required, unique, lowercase
- `password`: bcrypt hash, excluded from normal queries
- `createdAt`, `updatedAt`: Timestamps

### Tasks

- `user`: ObjectId reference to the owning user
- `title`: String, required, maximum 120 characters
- `description`: String, maximum 1000 characters
- `status`: `todo`, `in-progress`, or `done`
- `priority`: `low`, `medium`, or `high`
- `deadline`: Date
- `createdAt`, `updatedAt`: Timestamps

**Relationship:** One user can own multiple tasks. Task operations are scoped to the authenticated user.

## 🔌 REST API

Base URL: `/api`

Protected endpoints require:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/health` | No | API health check |
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Log in |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/tasks` | Yes | List and filter tasks |
| POST | `/tasks` | Yes | Create a task |
| GET | `/tasks/:id` | Yes | Get one task |
| PUT | `/tasks/:id` | Yes | Update a task |
| DELETE | `/tasks/:id` | Yes | Delete a task |

Task list query parameters include `status`, `priority`, `search`, `overdue=true`, and `sort`.

## 🚀 Deployment

### Database
Configure MongoDB Atlas and set the database connection string as `MONGO_URI` in the backend deployment's environment variables.

### Backend API
Deploy the `server` directory using the Vercel configuration in the repository. Configure `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.

### Frontend
Deploy the `client` directory on Vercel. Configure:

```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-DOMAIN.vercel.app/api
```

Replace the example domain with the verified backend deployment URL. Redeploy after changing environment variables.

### Verify the deployment
1. Open the frontend.
2. Register or log in.
3. Create, edit, and delete a task.
4. Refresh the dashboard and confirm saved tasks persist.

## 👩‍💻 Developer

**Anvitha Prasad**  
B.Tech Computer Science and Engineering

- GitHub: https://github.com/anveez

---

Developed as a full-stack task management project during the Cognevance internship.
