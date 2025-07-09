"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonField = void 0;
const parseJsonField = (field = "data") => (req, res, next) => {
    var _a;
    const raw = (_a = req.body) === null || _a === void 0 ? void 0 : _a[field];
    if (!raw)
        return next();
    try {
        req.body = JSON.parse(raw);
        next();
    }
    catch (_b) {
        res.status(400).json({
            success: false,
            message: `"${field}" must be valid JSON`,
        });
    }
};
exports.parseJsonField = parseJsonField;
