# 📚 Iskolar

A student web application with AI-powered note organization and quiz generation, built with React + TypeScript (frontend) and Express + TypeScript (backend), powered by Google Gemini.

---

## ✨ Features

- **Note Organizer** — Upload PDFs, images, or Word docs and get AI-structured notes (summary, key points, action items)
- **Generate Quiz** — Paste notes or upload a file and get a multiple-choice quiz with scoring and confetti
- **Note Upload(Like Gdrive)** - It's where you upload your study notes and stuff just like gdrive.

---

## 🗂️ Project Structure

```
Iskolar/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom hooks (logic layer)
│       ├── layouts/       # App shell / sidebar layout
│       ├── pages/         # Route-level page components
│       ├── services/      # API fetch calls
│       ├── types/         # Shared TypeScript interfaces
│       └── assets/        # Icons and images
│
└── backend/           # Express + TypeScript
    └── src/
        ├── routes/        # notes.ts, quiz.ts
        ├── middleware/    # Shared multer upload config
        └── server.ts      # Single entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Backend

```bash
cd backend
cp .env.example .env        # add your GEMINI_API_KEY
npm install
npm run dev                  # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:5000
npm install
npm run dev                  # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

**`backend/.env`**
```
GEMINI_API_KEY=your_key_here
PORT=5000
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000
```

---

## 🛠️ Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend | Express 5, TypeScript, ts-node |
| AI | Google Gemini 2.5 Flash |
| File parsing | Mammoth (DOCX), pdf-parse, Tesseract.js (OCR) |

---

Made by [@joshdev09](https://github.com/joshdev09)
