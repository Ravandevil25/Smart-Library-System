# Library Management System - Setup Guide

## Quick Start

### 1. Backend Setup (Terminal 1)

```bash
cd /home/saurav/Projects/gj/backend
npm install
# Edit config.env if needed
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup (Terminal 2)

```bash
cd /home/saurav/Projects/gj/frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Access the Application

Open your browser and go to: `http://localhost:5173`

## What Was Created

### Frontend Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── auth.ts       # Authentication API
│   │   ├── session.ts    # Entry/Exit API
│   │   ├── books.ts      # Book management API
│   │   ├── borrow.ts     # Borrowing API
│   │   ├── dashboard.ts  # Dashboard API
│   │   └── client.ts     # Axios instance
│   ├── components/       # Reusable components
│   │   ├── Header.tsx    # Top navigation
│   │   ├── QRScanner.tsx # QR code scanner
│   │   ├── BarcodeScanner.tsx # Barcode scanner
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   └── ProtectedRoute.tsx # Route guard
│   ├── context/          # React contexts
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── SocketContext.tsx  # Socket.IO connection
│   ├── pages/           # Page components
│   │   ├── Login.tsx    # Login page
│   │   ├── Register.tsx # Registration page
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── Borrow.tsx   # Book borrowing page
│   │   └── History.tsx  # User history page
│   ├── types/           # TypeScript types
│   │   └── index.ts     # All type definitions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── tailwind.config.js   # Tailwind CSS config
├── postcss.config.js    # PostCSS config
└── package.json
```

### Key Features Implemented

1. **Authentication System**
   - Login and registration pages
   - JWT token management
   - Protected routes
   - Auth context for global state

2. **Dashboard**
   - Real-time occupancy tracking
   - QR code scanning for entry/exit
   - User statistics display
   - Active session monitoring (for admins)

3. **Book Borrowing**
   - Barcode scanning interface
   - Multiple book selection
   - PDF receipt generation
   - Borrow history

4. **History & Tracking**
   - Session history
   - Borrow history
   - User statistics

5. **Real-time Updates**
   - Socket.IO integration
   - Live occupancy updates
   - Real-time notifications

6. **Modern UI/UX**
   - Black and white minimalist theme
   - Framer Motion animations
   - Fully responsive design
   - Mobile-friendly

## Environment Variables

### Backend (`backend/config.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Database

The application uses MongoDB with the following models:
- User (students, librarians, guards, admins)
- Book (with barcode and availability)
- Session (entry/exit tracking)
- BorrowRecord (borrowing history)
- Receipt (PDF receipt metadata)

## Testing

1. Start both backend and frontend servers
2. Register a new user (or login with existing credentials)
3. Test QR scanning for entry/exit
4. Test barcode scanning for book borrowing
5. View dashboard and history pages
6. Check real-time updates

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve dist/ directory with nginx, apache, or similar
```

## Troubleshooting

### Backend Issues
- Make sure MongoDB is running
- Check config.env file exists
- Verify JWT_SECRET is set

### Frontend Issues
- Check .env file exists
- Verify backend is running on correct port
- Check browser console for errors

### Camera Permissions
- Browser may prompt for camera permissions
- Make sure to allow camera access for QR/barcode scanning

## Next Steps

1. Configure MongoDB Atlas for production
2. Set up environment variables for production
3. Configure production build and deployment
4. Add additional features as needed

