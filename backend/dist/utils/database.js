"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connect to MongoDB with retries and exponential backoff.
 * This prevents the process from exiting on a single transient failure
 * and provides clearer logging for diagnosis.
 */
const connectDB = async (options = {}) => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management';
    const maxRetries = Number(process.env.MONGO_CONNECT_RETRIES || 5);
    const baseDelayMs = Number(process.env.MONGO_CONNECT_DELAY_MS || 2000);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const conn = await mongoose_1.default.connect(mongoURI, options);
            console.log(`MongoDB connected: ${conn.connection.host}`);
            // Attach event listeners for runtime diagnostics
            mongoose_1.default.connection.on('error', (err) => {
                console.error('MongoDB runtime error:', err);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                console.warn('MongoDB disconnected');
            });
            return;
        }
        catch (error) {
            const isLast = attempt === maxRetries;
            console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error && error.message ? error.message : error);
            if (isLast) {
                console.error('All MongoDB connection attempts failed. Exiting process.');
                // Keep the process exit to avoid running without a DB in production
                process.exit(1);
            }
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map