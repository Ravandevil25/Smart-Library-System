"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
router.post('/entry', auth_1.authenticate, sessionController_1.entry);
router.post('/exit', auth_1.authenticate, sessionController_1.exit);
exports.default = router;
//# sourceMappingURL=session.js.map