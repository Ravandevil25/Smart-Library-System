"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyReceiptToken = exports.generateReceiptToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '7d'
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};
exports.verifyToken = verifyToken;
const generateReceiptToken = (receiptId) => {
    return jsonwebtoken_1.default.sign({ receiptId }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '24h'
    });
};
exports.generateReceiptToken = generateReceiptToken;
const verifyReceiptToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};
exports.verifyReceiptToken = verifyReceiptToken;
//# sourceMappingURL=jwt.js.map