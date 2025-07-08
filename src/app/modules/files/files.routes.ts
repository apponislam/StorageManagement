import { Router } from "express";
import { sendFileToUploadcare, upload } from "../../utils/uploadcare";
import { uploadcareMiddleware } from "../../middlewares/uploadcareMiddleware";
import { FileController } from "./files.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/upload", auth(), upload.single("file"), uploadcareMiddleware, FileController.createFile);

router.get("/myfiles", auth(), FileController.getAllFiles);

router.get("/myfiles/summary", auth(), FileController.getStorageSummary);

router.get("/myfiles/summarybytype", auth(), FileController.getCategorySummary);

export const fileRoute = router;
