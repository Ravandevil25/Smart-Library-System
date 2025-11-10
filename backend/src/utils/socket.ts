import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

export const setupSocketIO = (server: HTTPServer) => {
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.user.name} connected`);

    // Join user to their role-based room
    socket.join(socket.data.user.role);

    // Join admin/librarian to admin room for real-time updates
    if (['admin', 'librarian'].includes(socket.data.user.role)) {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user.name} disconnected`);
    });
  });

  return io;
};

export const emitOccupancyUpdate = (io: SocketIOServer, occupancyData: any) => {
  io.to('admin').emit('occupancy:update', occupancyData);
};

export const emitBorrowUpdate = (io: SocketIOServer, borrowData: any) => {
  io.to('admin').emit('borrow:update', borrowData);
};
