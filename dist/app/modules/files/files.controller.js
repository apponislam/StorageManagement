"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const files_services_1 = require("./files.services");
const formatBytes_1 = require("../../utils/formatBytes");
const createFile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { ucFile } = req;
    console.log("user", (_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    console.log("ucFile", ucFile);
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b._id) || !ucFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Missing user or file",
            data: null,
        });
    }
    const originalFilename = (_c = ucFile.originalFilename) !== null && _c !== void 0 ? _c : ucFile.name;
    const ext = (originalFilename.split(".").pop() || "").toLowerCase();
    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    const generatedName = `${baseName}_${Date.now()}`;
    const fileUrl = `${ucFile.cdnUrl}${originalFilename}`;
    const newFile = {
        name: generatedName,
        path: fileUrl,
        size: ucFile.size,
        type: ext,
        owner: new mongoose_1.Types.ObjectId(req.user._id),
        parentFolder: req.body.parentFolder ? new mongoose_1.Types.ObjectId(req.body.parentFolder) : undefined,
        isDeleted: false,
    };
    const result = yield files_services_1.FileServices.createFile(newFile);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "File uploaded successfully",
        data: result,
    });
}));
const getAllFiles = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const files = yield files_services_1.FileServices.getAllFiles({
        owner: new mongoose_1.Types.ObjectId(req.user._id),
        parentFolder: req.query.parentFolder,
        isDeleted: false,
        type: req.query.type,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Files retrieved successfully",
        data: files,
    });
}));
const getStorageSummary = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const { limit, used } = yield files_services_1.FileServices.getStorageSummary(new mongoose_1.Types.ObjectId(req.user._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Storage summary retrieved",
        data: {
            storageLimit: (0, formatBytes_1.formatBytes)(limit),
            usageStorage: (0, formatBytes_1.formatBytes)(used),
        },
    });
}));
const getCategorySummary = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const raw = yield files_services_1.FileServices.getCategorySummary(new mongoose_1.Types.ObjectId(req.user._id));
    const data = {
        notes: { count: raw.notes.count, storage: (0, formatBytes_1.formatBytes)(raw.notes.storage) },
        images: { count: raw.images.count, storage: (0, formatBytes_1.formatBytes)(raw.images.storage) },
        pdf: { count: raw.pdf.count, storage: (0, formatBytes_1.formatBytes)(raw.pdf.storage) },
    };
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "File type summary",
        data,
    });
}));
const toggleFavoriteStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fileId } = req.params;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const updatedFile = yield files_services_1.FileServices.toggleFavorite(fileId, new mongoose_1.Types.ObjectId(req.user._id));
    if (!updatedFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Favorite status toggled successfully",
        data: updatedFile,
    });
}));
const getFavorites = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const files = yield files_services_1.FileServices.getFavoriteFiles(new mongoose_1.Types.ObjectId(req.user._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Favorite files retrieved successfully",
        data: files,
    });
}));
const renameFileController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fileId } = req.params;
    const { name } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    if (!name || name.trim() === "") {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "New name is required",
            data: null,
        });
    }
    const updatedFile = yield files_services_1.FileServices.renameFile(fileId, new mongoose_1.Types.ObjectId(req.user._id), name.trim());
    if (!updatedFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "File renamed successfully",
        data: updatedFile,
    });
}));
const getFilesByDate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    if ((start && isNaN(startDate.valueOf())) || (end && isNaN(endDate.valueOf()))) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Invalid date format. Use ISO (YYYY‑MM‑DD).",
            data: null,
        });
    }
    const files = yield files_services_1.FileServices.getFilesByDateRange({
        owner: new mongoose_1.Types.ObjectId(req.user._id),
        start: startDate,
        end: endDate,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Files retrieved successfully",
        data: files,
    });
}));
const duplicateFile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const newFile = yield files_services_1.FileServices.duplicateFile(req.params.fileId, new mongoose_1.Types.ObjectId(req.user._id));
    if (!newFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "File duplicated successfully",
        data: newFile,
    });
}));
const copyToFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const { fileId, folderId } = req.params;
    const newFile = yield files_services_1.FileServices.copyFileToFolder(fileId, new mongoose_1.Types.ObjectId(req.user._id), new mongoose_1.Types.ObjectId(folderId));
    if (!newFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "File or destination folder not found / no permission",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "File copied to folder successfully",
        data: newFile,
    });
}));
const moveToFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }
    const { fileId, folderId } = req.params;
    const movedFile = yield files_services_1.FileServices.moveFileToFolder(fileId, new mongoose_1.Types.ObjectId(req.user._id), new mongoose_1.Types.ObjectId(folderId));
    if (!movedFile) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "File or destination folder not found / no permission",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "File moved to folder successfully",
        data: movedFile,
    });
}));
exports.FileController = {
    createFile,
    getAllFiles,
    getStorageSummary,
    getCategorySummary,
    toggleFavoriteStatus,
    getFavorites,
    renameFileController,
    getFilesByDate,
    duplicateFile,
    copyToFolder,
    moveToFolder,
};
