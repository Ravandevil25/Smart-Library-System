export interface JWTPayload {
    userId: string;
    rollNo: string;
    role: string;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateReceiptToken: (receiptId: string) => string;
export declare const verifyReceiptToken: (token: string) => {
    receiptId: string;
};
//# sourceMappingURL=jwt.d.ts.map