"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const session_1 = __importDefault(require("./session"));
const book_1 = __importDefault(require("./book"));
const borrow_1 = __importDefault(require("./borrow"));
const dashboard_1 = __importDefault(require("./dashboard"));
const ai_1 = __importDefault(require("./ai"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/session', session_1.default);
router.use('/books', book_1.default);
router.use('/borrow', borrow_1.default);
router.use('/dashboard', dashboard_1.default);
router.use('/ai', ai_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map