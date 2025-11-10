import { Response } from 'express';
import { AuthRequest } from '../utils/auth';
export declare const entry: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const exit: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=sessionController.d.ts.map