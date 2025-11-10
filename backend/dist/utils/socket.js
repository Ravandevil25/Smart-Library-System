"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitBorrowUpdate = exports.emitOccupancyUpdate = exports.setupSocketIO = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const models_1 = require("../models");
const setupSocketIO = (server) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const io = new socket_io_1.Server(server, {
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
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await models_1.User.findById(decoded.userId).select('-password');
            if (!user) {
                return next(new Error('Authentication error'));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
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
exports.setupSocketIO = setupSocketIO;
const emitOccupancyUpdate = (io, occupancyData) => {
    io.to('admin').emit('occupancy:update', occupancyData);
};
exports.emitOccupancyUpdate = emitOccupancyUpdate;
const emitBorrowUpdate = (io, borrowData) => {
    io.to('admin').emit('borrow:update', borrowData);
};
exports.emitBorrowUpdate = emitBorrowUpdate;
//# sourceMappingURL=socket.js.map