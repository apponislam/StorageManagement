"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRoute = void 0;
const express_1 = require("express");
const uploadcare_1 = require("../../utils/uploadcare");
const uploadcareMiddleware_1 = require("../../middlewares/uploadcareMiddleware");
const files_controller_1 = require("./files.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const files_validation_1 = require("./files.validation");
const router = (0, express_1.Router)();
router.post("/upload", (0, auth_1.default)(), uploadcare_1.upload.single("file"), uploadcareMiddleware_1.uploadcareMiddleware, files_controller_1.FileController.createFile);
router.get("/myfiles", (0, auth_1.default)(), files_controller_1.FileController.getAllFiles);
router.get("/myfiles/summary", (0, auth_1.default)(), files_controller_1.FileController.getStorageSummary);
router.get("/myfiles/summarybytype", (0, auth_1.default)(), files_controller_1.FileController.getCategorySummary);
router.patch("/myfiles/:fileId/favorite", (0, auth_1.default)(), files_controller_1.FileController.toggleFavoriteStatus);
router.get("/myfiles/favorites", (0, auth_1.default)(), files_controller_1.FileController.getFavorites);
router.patch("/myfiles/:fileId/rename", (0, auth_1.default)(), (0, validateRequest_1.default)(files_validation_1.updateFileSchema), files_controller_1.FileController.renameFileController);
router.get("/myfiles/by-date", (0, auth_1.default)(), files_controller_1.FileController.getFilesByDate);
router.post("/myfiles/:fileId/duplicate", (0, auth_1.default)(), files_controller_1.FileController.duplicateFile);
router.post("/myfiles/:fileId/copy-to/:folderId", (0, auth_1.default)(), files_controller_1.FileController.copyToFolder);
router.post("/myfiles/:fileId/move-to/:folderId", (0, auth_1.default)(), files_controller_1.FileController.moveToFolder);
exports.fileRoute = router;
