import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare const setupSocketIO: (server: HTTPServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const emitOccupancyUpdate: (io: SocketIOServer, occupancyData: any) => void;
export declare const emitBorrowUpdate: (io: SocketIOServer, borrowData: any) => void;
//# sourceMappingURL=socket.d.ts.map