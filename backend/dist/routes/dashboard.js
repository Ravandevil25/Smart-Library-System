"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
router.get('/occupancy', dashboardController_1.getOccupancy);
router.get('/active-sessions', dashboardController_1.getActiveSessions);
router.get('/users/history', auth_1.authenticate, dashboardController_1.getUserHistory);
router.get('/users/summary', auth_1.authenticate, dashboardController_1.getUserSummary);
exports.default = router;
//# sourceMappingURL=dashboard.js.map