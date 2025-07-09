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
exports.FolderController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const folders_services_1 = require("./folders.services");
const mongoose_1 = require("mongoose");
const handleSecretFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin, confirmPin } = req.body;
    const result = yield folders_services_1.FolderServices.handleSecretFolder({
        pin,
        confirmPin,
        owner: new mongoose_1.Types.ObjectId(req.user._id),
    });
    (0, sendResponse_1.default)(res, {
        statusCode: result.action === "created" ? http_status_1.default.CREATED : http_status_1.default.OK,
        success: true,
        message: result.action === "created" ? "Secret folder created successfully" : "Secret folder accessed successfully",
        data: result.folder,
    });
}));
const createFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, parentFolder } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const folderType = "normal";
    const result = yield folders_services_1.FolderServices.createFolder({
        name,
        folderType,
        owner: new mongoose_1.Types.ObjectId(req.user._id),
        parentFolder,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Folder created successfully",
        data: result,
    });
}));
const getFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const result = yield folders_services_1.FolderServices.getFolder(id, new mongoose_1.Types.ObjectId(req.user._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Folder retrieved successfully",
        data: result,
    });
}));
const updateFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, parentFolder } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    const result = yield folders_services_1.FolderServices.updateFolder({
        folderId: id,
        userId: new mongoose_1.Types.ObjectId(req.user._id),
        updateData: { name, parentFolder },
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Folder updated successfully",
        data: result,
    });
}));
const deleteFolder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }
    yield folders_services_1.FolderServices.deleteFolder(id, new mongoose_1.Types.ObjectId(req.user._id));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Folder deleted successfully",
        data: null,
    });
}));
exports.FolderController = {
    handleSecretFolder,
    createFolder,
    getFolder,
    updateFolder,
    deleteFolder,
};
