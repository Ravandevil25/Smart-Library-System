import { Request, Response } from 'express';
import { AuthRequest } from '../utils/auth';
export declare const borrow: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const returnBooks: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyReceipt: (req: Request, res: Response) => Promise<Response | void>;
//# sourceMappingURL=borrowController.d.ts.map