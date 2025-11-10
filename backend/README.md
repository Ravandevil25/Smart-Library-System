# Library Management System

A comprehensive library management system built with React, Node.js, MongoDB, and Socket.IO for real-time communication.

## Features

- **Authentication**: JWT-based login for students, librarians, guards, and admins
- **Entry/Exit System**: QR code scanning for library entry and exit tracking
- **Book Borrowing**: Barcode scanning for book borrowing with PDF receipt generation
- **Real-time Dashboard**: Live occupancy tracking and session management
- **Role-based Access**: Different interfaces for students, librarians, and admins
- **PDF Receipts**: Automated receipt generation for book borrowing

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- bcryptjs for password hashing
- pdfkit for PDF generation

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- html5-qrcode for QR/barcode scanning
- Socket.IO client for real-time updates

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/library-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in MONGODB_URI
   ```

## Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## Usage

### For Students

1. **Login**: Use your roll number and password
2. **Entry**: Scan the QR code at the library entrance
3. **Borrow Books**: Scan book barcodes and download the receipt
4. **Show Receipt**: Present the PDF receipt to the guard
5. **Exit**: Scan the QR code at the library exit

### For Librarians/Admins

1. **Login**: Use your credentials
2. **Admin Dashboard**: View real-time occupancy and active sessions
3. **Add Books**: Use the admin interface to add new books to the system

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Entry/Exit
- `POST /api/entry` - Record library entry
- `POST /api/exit` - Record library exit

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:barcode` - Get book by barcode
- `POST /api/books/add` - Add new book (admin only)

### Borrowing
- `POST /api/borrow` - Borrow books
- `POST /api/return` - Return books
- `GET /api/receipt/verify` - Verify receipt

### Dashboard
- `GET /api/dashboard/occupancy` - Get current occupancy
- `GET /api/dashboard/active-sessions` - Get active sessions
- `GET /api/dashboard/users/:id/history` - Get user history
- `GET /api/dashboard/users/:id/summary` - Get user summary

## Real-time Features

The system uses Socket.IO for real-time updates:

- **Occupancy Updates**: Live updates when students enter/exit
- **Borrow Updates**: Real-time notifications for book borrowing/returning
- **Admin Dashboard**: Live occupancy counter and active sessions list

## Database Models

- **User**: Student, librarian, guard, admin information
- **Book**: Book details with barcode and availability
- **Session**: Library entry/exit sessions
- **BorrowRecord**: Book borrowing records
- **Receipt**: PDF receipt information

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
