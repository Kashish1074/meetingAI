# MeetingAI — MERN Stack Meeting Analyzer

A full-stack AI Meeting Analyzer built with MongoDB, Express, React, and Node.js. Analyzes meeting transcripts to extract action items, unresolved topics, participation dominance, and keyword topic clusters — with zero ML or speech processing.

---

## Project Structure

```
meeting-analyzer/
├── backend/                  # Express + MongoDB API
│   ├── controllers/
│   │   ├── analyzerEngine.js  # Core NLP rule engine
│   │   ├── authController.js
│   │   └── meetingController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT middleware
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Meeting.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── meetings.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js         # Sidebar + Outlet
    │   │   └── AnalysisResult.js # Shared analysis UI (tabs + chart)
    │   ├── context/
    │   │   └── AuthContext.js    # JWT auth state
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js      # Stats + meeting history
    │   │   ├── Analyzer.js       # Transcript input + live analysis
    │   │   └── MeetingDetail.js  # Saved meeting + toggle actions
    │   ├── services/
    │   │   └── api.js            # Axios instance + API helpers
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Features

- **JWT authentication** — register, login, protected routes
- **Transcript analysis** — rule-based NLP, no ML required
- **Participation dominance** — word frequency per speaker with bar chart
- **Action item detection** — modal obligation signal scanning
- **Unresolved topic detection** — hedging/blocking language patterns
- **Keyword topic clustering** — 5 semantic domains
- **AI insight generation** — plain-English dominance summary
- **Saved meetings** — full CRUD with pagination
- **Toggle action/unresolved** — mark items done in detail view
- **Dashboard stats** — aggregate counts across all meetings

---

## Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Backend runs on http://localhost:5000

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs on http://localhost:3000

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Meetings (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/meetings/analyze | Analyze without saving |
| POST | /api/meetings | Analyze and save |
| GET | /api/meetings | List user's meetings |
| GET | /api/meetings/:id | Get single meeting |
| DELETE | /api/meetings/:id | Delete meeting |
| PATCH | /api/meetings/:id/action/:itemId | Toggle action done |
| PATCH | /api/meetings/:id/unresolved/:itemId | Toggle resolved |
| GET | /api/meetings/stats/summary | Dashboard stats |

---

## Transcript Format

For best results, use labeled speaker turns:

```
Alice: I think we should move the launch date to Q3.
Bob: Agreed, but we haven't resolved the pricing model.
Alice: Can you own the pricing research by Friday, Bob?
```

Plain text (no speaker labels) works too — action/topic detection still runs, but dominance analysis is skipped.

---

## Analysis Engine

All analysis is rule-based in `backend/controllers/analyzerEngine.js`:

- **Speaker parsing** — regex `Name: message` pattern
- **Word frequency** — counts tokens per speaker for dominance %
- **Action detection** — scans for modal signals (`can you`, `need to`, `by Friday`, `I'll`…)
- **Unresolved detection** — hedging phrases (`still open`, `not yet`, `tbd`, `table it`…)
- **Topic clustering** — 5 keyword clusters: timeline, budget, technical, marketing, team/process
- **Insight synthesis** — rule-based paragraph from dominance + silence counts
