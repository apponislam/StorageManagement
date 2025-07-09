"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const folders_routes_1 = require("../modules/folders/folders.routes");
const files_routes_1 = require("../modules/files/files.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.UserRoutes,
    },
    {
        path: "/folders",
        route: folders_routes_1.FolderRoutes,
    },
    {
        path: "/files",
        route: files_routes_1.fileRoute,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
