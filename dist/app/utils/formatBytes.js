"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBytes = void 0;
const formatBytes = (bytes) => {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
};
exports.formatBytes = formatBytes;
