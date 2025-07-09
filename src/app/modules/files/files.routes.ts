import { Router } from "express";
import { upload } from "../../utils/uploadcare";
import { uploadcareMiddleware } from "../../middlewares/uploadcareMiddleware";
import { FileController } from "./files.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { updateFileSchema } from "./files.validation";

const router = Router();

router.post("/upload", auth(), upload.single("file"), uploadcareMiddleware, FileController.createFile);

router.get("/myfiles", auth(), FileController.getAllFiles);

router.get("/myfiles/summary", auth(), FileController.getStorageSummary);

router.get("/myfiles/summarybytype", auth(), FileController.getCategorySummary);

router.patch("/myfiles/:fileId/favorite", auth(), FileController.toggleFavoriteStatus);

router.get("/myfiles/favorites", auth(), FileController.getFavorites);

router.patch("/myfiles/:fileId/rename", auth(), validateRequest(updateFileSchema), FileController.renameFileController);

router.get("/myfiles/by-date", auth(), FileController.getFilesByDate);

export const fileRoute = router;
