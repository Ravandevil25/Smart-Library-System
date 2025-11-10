"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrowController_1 = require("../controllers/borrowController");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('student'), borrowController_1.borrow);
router.post('/return', auth_1.authenticate, (0, auth_1.authorize)('student'), borrowController_1.returnBooks);
router.get('/verify', borrowController_1.verifyReceipt);
exports.default = router;
//# sourceMappingURL=borrow.js.map