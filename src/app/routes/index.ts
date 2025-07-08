import express from "express";
import { UserRoutes } from "../modules/auth/auth.routes";
import { FolderRoutes } from "../modules/folders/folders.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
