"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const notFound_1 = __importDefault(require("./app/errors/notFound"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandaler_1 = __importDefault(require("./app/errors/globalErrorHandaler"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({ message: "Storage Management Server is running" });
});
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandaler_1.default);
app.use(notFound_1.default);
exports.default = app;
