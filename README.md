# 🎓 Student Tools — AI-Powered Academic Assistant Platform

A full-stack web app that helps university students improve writing, check similarity,
summarize documents, generate citations, plan study time, and track progress.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express (ES modules)
- **Database:** MySQL
- **Auth:** JWT + bcrypt password hashing
- **AI:** provider-agnostic service (mock by default; plug in OpenAI/Gemini later)

## Project Structure
```
student-tools/
├── backend/
│   ├── src/
│   │   ├── config/       # db connection, schema.sql, initDb
│   │   ├── controllers/  # request handlers (auth done; tools next)
│   │   ├── middleware/    # auth, upload, error handling
│   │   ├── routes/        # authRoutes, toolRoutes
│   │   ├── services/      # aiService (mock + real providers)
│   │   └── server.js      # app entry point
│   └── uploads/           # uploaded files (gitignored)
└── frontend/
    └── src/
        ├── components/    # Navbar, ProtectedRoute, ToolPlaceholder
        ├── context/       # AuthContext
        ├── lib/           # axios api client
        └── pages/         # Home, Login, Register, Dashboard, tools…
```

## Getting Started

### 1. Database (MySQL must be installed & running)
```bash
cd backend
cp .env.example .env       # then edit .env with your MySQL password + a JWT secret
npm install
npm run db:init            # creates the database and all tables
```

### 2. Backend
```bash
cd backend
npm run dev                # starts http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                # starts http://localhost:5173
```

Open http://localhost:5173 — you can register, log in, and reach the dashboard.
The tool pages are placeholders wired to stub API routes, ready to build in Phase 3/4.

## What works now (Phase 1 + Auth)
- ✅ Full project skeleton (frontend + backend + DB schema)
- ✅ Register / Login with validation, bcrypt hashing, JWT
- ✅ Protected routes (front and back)
- ✅ File upload middleware (type + size restrictions)
- ✅ AI service abstraction with a no-cost mock

## Next steps
- **Phase 3:** Paraphrase, Summarizer, Citation Generator controllers
- **Phase 4:** Similarity Checker (embeddings), Study Planner, Progress
- **Phase 5:** Testing
