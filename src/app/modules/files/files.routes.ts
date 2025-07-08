import { Router } from "express";
import { sendFileToUploadcare, upload } from "../../utils/uploadcare";
import { uploadcareMiddleware } from "../../middlewares/uploadcareMiddleware";
import { FileController } from "./files.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/upload", auth(), upload.single("file"), uploadcareMiddleware, FileController.createFile);

export const fileRoute = router;
