"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettifyName = void 0;
const prettifyName = (raw) => {
    if (!raw)
        return "user";
    return raw.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
};
exports.prettifyName = prettifyName;
