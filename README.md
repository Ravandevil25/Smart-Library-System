# Library Management System

This repository contains a full-stack Library Management System with:

- QR code based entry/exit tracking
- Barcode-based book borrowing
- PDF receipt generation
- Real-time dashboard and occupancy monitoring (Socket.IO)
- Role-based authentication (Student, Librarian, Guard, Admin)

This README gives a concise, step-by-step guide to understanding, running, and developing the project.

## Quick links

- Backend: `backend/` (Node.js + TypeScript + Express)
- Frontend: `frontend/` (React + TypeScript + Vite)

## Table of contents

1. [What is included](#what-is-included)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Backend details](#backend-details)
5. [Frontend details](#frontend-details)
6. [API overview](#api-overview)
7. [Scripts & utilities](#scripts--utilities)
8. [Folder structure summary](#folder-structure-summary)
9. [Development tips & troubleshooting](#development-tips--troubleshooting)
10. [Contributing & license](#contributing--license)

## What is included

- Backend server with REST API, authentication, session and borrow management, PDF receipt generation, and Socket.IO support.
- Frontend SPA with scanning components (QR and barcode), dashboard, borrow flow, and user history pages.
- Seed scripts and utilities for generating QR codes and barcodes.

## Prerequisites

- Node.js v16+ (recommend latest LTS)
- npm (or yarn)
- MongoDB (local `mongod` or MongoDB Atlas)
- A modern browser (for camera access when scanning)

## Quick start

1. Start MongoDB (if using local DB):

```bash
# start local MongoDB (example)
mongod --dbpath ~/mongodb-data
```

2. Start the backend (terminal 1):

```bash
cd backend
npm install
# create or edit backend/config.env (or use .env pattern if needed)
npm run dev
```

3. Start the frontend (terminal 2):

```bash
cd frontend
npm install
# create .env if you need to override defaults (see Backend details)
npm run dev
```

4. Open the app in browser (default Vite port):

http://localhost:5173

By default the backend listens on port 5000 (http://localhost:5000) and the frontend expects the API at `http://localhost:5000/api`.

## Backend details

Location: `backend/` (TypeScript)

- Main entry: `src/server.ts`
- Config: `backend/config.env` (example values below)

Example `config.env` (create in `backend/`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Key npm scripts (see `backend/package.json`):

- `npm run dev` — start backend in development (nodemon + ts-node)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled server (`node dist/server.js`)
- `npm run seed` — run `seed.ts` to create example users/books
- `npm run generate-qr` — generate entry/exit QR codes (`generate-qr.ts`)
- `npm run generate-barcodes` — generate barcode images (`generate-barcodes.ts`)

Useful backend files:

- `seed.ts` — seeds DB with initial data (run after `npm install`)
- `generate-qr.ts`, `generate-barcodes.ts` — helper scripts to produce QR/barcode assets (outputs in `barcodes/` and `qr-codes/`)

If you use MongoDB Atlas, put the connection string in `MONGODB_URI`.

## Frontend details

Location: `frontend/` (React + Vite + TypeScript)

- Main entry: `src/main.tsx` and `src/App.tsx`
- Environment variables (create `.env` in `frontend/` if needed):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Key scripts (`frontend/package.json`):

- `npm run dev` — start Vite dev server (default `http://localhost:5173`)
- `npm run build` — build production assets to `dist/`
- `npm run preview` — preview the production build

The frontend contains camera-based components for QR and barcode scanning. Your browser will prompt to allow camera access.

## API overview

This project uses REST endpoints under `/api`. The most-used routes are:

- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Session (entry/exit): `POST /api/entry`, `POST /api/exit`
- Books: `GET /api/books`, `GET /api/books/:barcode`, `POST /api/books/add` (admin)
- Borrow: `POST /api/borrow`, `POST /api/return`
- Receipt: `GET /api/receipt/verify`
- Dashboard: `GET /api/dashboard/occupancy`, `GET /api/dashboard/active-sessions`, `GET /api/dashboard/users/:id/history`

Authentication uses JWT tokens. Protected routes require the token in the Authorization header: `Authorization: Bearer <token>`.

## Scripts & utilities

- Seed the database (example data):

```bash
cd backend
npm run seed
```

- Generate QR codes and barcodes (assets stored under `backend/qr-codes` and `backend/barcodes`):

```bash
cd backend
npm run generate-qr
npm run generate-barcodes
```

## Folder structure summary

Top-level folders:

- `backend/` — server, TS sources, utilities, scripts
- `frontend/` — client app, components, styles

Notable backend subfolders:

- `backend/src/controllers/`, `backend/src/models/`, `backend/src/routes/`, `backend/src/utils/`
- `backend/barcodes/`, `backend/qr-codes/` — generated assets

Notable frontend subfolders:

- `frontend/src/components/` — reusable components (QRScanner, BarcodeScanner, Header, etc.)
- `frontend/src/pages/` — pages (Dashboard, Borrow, History, Login, Register)
- `frontend/src/api/` — API client code

## Development tips & troubleshooting

- Camera/Media: If the scanner fails, check browser camera permissions and try a different browser.
- MongoDB: Ensure `mongod` is running or use Atlas. Check `MONGODB_URI`.
- Environment vars: Make sure `config.env` and/or `.env` files exist with correct URLs and secrets.
- Ports: Backend defaults to 5000. If port conflicts occur, change `PORT` in `config.env`.
- Build issues: If TypeScript errors show after edits, run `cd backend && npm run build` to see compile errors.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes and run locally
4. Add tests where appropriate
5. Submit a pull request

Please follow existing code style and add type annotations when touching TypeScript code.

## License

MIT

## Deployment

### Deploying to Vercel

For detailed instructions on deploying this application to Vercel, see **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**.

The deployment guide covers:
- Frontend deployment on Vercel
- Backend deployment options (Railway, Render, etc.)
- Environment variable configuration
- CORS setup
- Troubleshooting common issues

**Quick Deploy:**
1. Deploy backend to Railway/Render (see `VERCEL_DEPLOYMENT.md`)
2. Deploy frontend to Vercel with environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
   - `VITE_SOCKET_URL=https://your-backend-url.com`

## Where to go next

- To run a quick demo: start backend + frontend, register a test user, use the QR scanner to create a session, and try borrowing a book via the barcode scanner.
- To prepare for production: set up MongoDB Atlas, secure environment variables, build both apps, and host the frontend behind a static server or CDN.
- To deploy to Vercel: follow the comprehensive guide in `VERCEL_DEPLOYMENT.md`.

If you'd like, I can also:

- add a top-level `.env.example` and `backend/.env.example` and `frontend/.env.example` files
- add a short CONTRIBUTING.md
- generate a minimal health-check endpoint for easy containerization

---

If you'd like any section expanded (example envs, API contract examples, or a developer quick-checklist), tell me which parts and I'll add them.


# Smart-Library-System
