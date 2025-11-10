import mongoose from 'mongoose';
/**
 * Connect to MongoDB with retries and exponential backoff.
 * This prevents the process from exiting on a single transient failure
 * and provides clearer logging for diagnosis.
 */
declare const connectDB: (options?: mongoose.ConnectOptions) => Promise<void>;
export default connectDB;
//# sourceMappingURL=database.d.ts.map