"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./utils/database"));
const routes_1 = __importDefault(require("./routes"));
const socket_1 = require("./utils/socket");
// Load environment variables
dotenv_1.default.config({ path: './config.env' });
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Connect to database
(0, database_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (PDF receipts)
app.use('/api/receipt/download', express_1.default.static(path_1.default.join(__dirname, 'pdf/receipts')));
// Serve uploaded e-books
app.use('/api/ebooks', express_1.default.static(path_1.default.join(__dirname, 'ebooks')));
// Ensure ebooks directory exists
try {
    const ebooksDir = path_1.default.join(__dirname, 'ebooks');
    if (!fs_1.default.existsSync(ebooksDir))
        fs_1.default.mkdirSync(ebooksDir, { recursive: true });
}
catch (err) {
    console.warn('Could not ensure ebooks directory exists', err);
}
// Routes
app.use('/api', routes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Library Management System API is running' });
});
// Setup Socket.IO
const io = (0, socket_1.setupSocketIO)(server);
// Make io available to routes
app.set('io', io);
// Error handling middleware
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map