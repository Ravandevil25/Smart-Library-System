# Library Management System - Frontend

A modern React frontend for the Library Management System with black and white theme, responsive design, and smooth animations powered by Framer Motion.

## Features

- **Authentication**: Login and registration with role-based access
- **QR Code Scanner**: For library entry and exit
- **Barcode Scanner**: For book borrowing
- **Real-time Updates**: Socket.IO integration for live updates
- **Modern UI**: Black and white theme with smooth animations
- **Responsive Design**: Mobile-first approach

## Tech Stack

- React 19 with TypeScript
- Vite for fast development
- Framer Motion for animations
- React Router for navigation
- Socket.IO Client for real-time updates
- html5-qrcode for QR/Barcode scanning
- TailwindCSS for styling
- Axios for API calls

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend URL if different from default:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
  ├── api/          # API client and endpoints
  ├── components/   # Reusable components
  ├── context/      # React contexts (Auth, Socket)
  ├── pages/        # Page components
  ├── types/        # TypeScript type definitions
  ├── utils/        # Utility functions
  ├── hooks/        # Custom React hooks
  ├── App.tsx       # Main app component
  └── main.tsx      # Entry point
```

## Key Pages

- **Login**: User authentication
- **Register**: New user registration
- **Dashboard**: Overview with occupancy tracking and entry/exit controls
- **Borrow**: Book borrowing interface with barcode scanning
- **History**: User's session and borrow history

## Features

### For Students
- Scan QR code for library entry/exit
- Scan barcodes to borrow books
- View personal statistics (hours spent, books borrowed)
- View history of sessions and borrows
- Download PDF receipts for borrowed books

### For Admins/Librarians
- View real-time library occupancy
- See active sessions with user details
- Monitor library usage

## Components

- **Header**: Top navigation with user info and logout
- **QRScanner**: Camera-based QR code scanning
- **BarcodeScanner**: Camera-based barcode scanning
- **Layout**: Main layout with navigation
- **ProtectedRoute**: Route guard for authenticated pages

## API Integration

The frontend communicates with the backend via REST API and WebSocket:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Session**: `/api/entry`, `/api/exit`
- **Books**: `/api/books`, `/api/books/:barcode`
- **Borrow**: `/api/borrow`
- **Dashboard**: `/api/dashboard/occupancy`, `/api/dashboard/users/summary`

## Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_SOCKET_URL`: WebSocket server URL

## License

MIT
