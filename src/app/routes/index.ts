import express from "express";
import { UserRoutes } from "../modules/auth/auth.routes";
import { FolderRoutes } from "../modules/folders/folders.routes";
import { fileRoute } from "../modules/files/files.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: UserRoutes,
    },
    {
        path: "/folders",
        route: FolderRoutes,
    },
    {
        path: "/files",
        route: fileRoute,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
