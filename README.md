# PlacementOS — AI + ChatGPT Learning Tracker

A starter project for tracking preparation toward a ₹6 LPA fresher IT/software role.

## Features
- Dashboard for Java DSA, SQL/DBMS, aptitude, CS fundamentals, projects, and mock interviews
- Mark topics complete and track daily learning notes
- Export/import progress as JSON so you can share it in your ChatGPT conversation
- Optional OpenAI API tutor through a backend endpoint
- Local browser storage for quick setup

## Requirements
- Node.js 18+
- An OpenAI API key only if you want in-app AI tutoring

## Run the app

### 1. Start backend
```bash
cd server
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env if using the AI tutor
npm run dev
```

### 2. Start frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite.

## Important security notes
- Never put your OpenAI API key in frontend code.
- The API key stays in `server/.env`.
- API usage may incur separate charges.
- The ChatGPT conversation itself is not automatically connected to the app. Use Export Progress and paste/upload the JSON here for me to review and continue your plan.
- This starter uses browser localStorage. For cross-device sync or user accounts, add a database and authentication before deploying publicly.
