"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
// POST /api/ai/query
router.post('/query', aiController_1.queryAI);
exports.default = router;
//# sourceMappingURL=ai.js.map