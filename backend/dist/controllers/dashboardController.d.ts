import { Response, Request } from 'express';
import { AuthRequest } from '../utils/auth';
export declare const getOccupancy: (req: Request, res: Response) => Promise<void>;
export declare const getActiveSessions: (req: Request, res: Response) => Promise<void>;
export declare const getUserHistory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserSummary: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=dashboardController.d.ts.map