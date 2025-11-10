import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

import connectDB from './utils/database';
import routes from './routes';
import { setupSocketIO, emitOccupancyUpdate } from './utils/socket';

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();
const server = createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (PDF receipts)
app.use('/api/receipt/download', express.static(path.join(__dirname, 'pdf/receipts')));
// Serve uploaded e-books
app.use('/api/ebooks', express.static(path.join(__dirname, 'ebooks')));

// Ensure ebooks directory exists
try {
  const ebooksDir = path.join(__dirname, 'ebooks');
  if (!fs.existsSync(ebooksDir)) fs.mkdirSync(ebooksDir, { recursive: true });
} catch (err) {
  console.warn('Could not ensure ebooks directory exists', err);
}

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Library Management System API is running' });
});

// Setup Socket.IO
const io = setupSocketIO(server);

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler — use a middleware without a path so we don't pass '*' to path-to-regexp
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
