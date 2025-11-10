import jwt from 'jsonwebtoken';
import { IUser } from '../models';

export interface JWTPayload {
  userId: string;
  rollNo: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
};

export const generateReceiptToken = (receiptId: string): string => {
  return jwt.sign({ receiptId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

export const verifyReceiptToken = (token: string): { receiptId: string } => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { receiptId: string };
};
