import { Request, Response } from 'express';
import { AuthRequest } from '../utils/auth';
export declare const addBook: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllBooks: (req: Request, res: Response) => Promise<void>;
export declare const getBookByBarcode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addToWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addToReserve: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeFromReserve: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadEbook: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBook: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bookController.d.ts.map