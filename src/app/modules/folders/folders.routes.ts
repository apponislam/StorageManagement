import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { accessSecretFolderSchema, createFolderSchema, handleSecretFolderSchema, updateFolderSchema } from "./folders.validation";
import { FolderController } from "./folders.controller";

const router = express.Router();

router.post("/secret", auth(), validateRequest(handleSecretFolderSchema), FolderController.handleSecretFolder);

router.post("/", auth(), validateRequest(createFolderSchema), FolderController.createFolder);

router.get("/:id", auth(), FolderController.getFolder);

router.patch("/:id", auth(), validateRequest(updateFolderSchema), FolderController.updateFolder);

router.delete("/:id", auth(), FolderController.deleteFolder);

export const FolderRoutes = router;
