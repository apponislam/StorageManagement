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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderServices = void 0;
const mongoose_1 = require("mongoose");
const folders_model_1 = require("./folders.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const encryptPin = (pin) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(pin.toString(), Number(config_1.default.bcrypt_salt_rounds));
});
const comparePin = (enteredPin, storedPin) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(enteredPin, storedPin);
});
const handleSecretFolder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin, confirmPin, owner } = payload;
    const existingFolder = yield folders_model_1.Folder.findOne({
        owner,
        folderType: "secret",
        isDeleted: false,
    })
        .select("+pin")
        .populate("files")
        .populate("subfolders")
        .lean();
    if (existingFolder === null || existingFolder === void 0 ? void 0 : existingFolder.pin) {
        const isMatch = yield comparePin(pin, existingFolder.pin);
        if (!isMatch) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid PIN");
        }
        const { pin: _ } = existingFolder, folderData = __rest(existingFolder, ["pin"]);
        return { action: "accessed", folder: folderData };
    }
    if (!confirmPin) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "PIN confirmation required to create secret folder");
    }
    if (pin !== confirmPin) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "PIN and confirmation PIN don't match");
    }
    const hashedPin = yield encryptPin(Number(pin));
    const newFolder = yield folders_model_1.Folder.create({
        name: "Secret Folder",
        folderType: "secret",
        pin: hashedPin,
        owner,
    });
    return { action: "created", folder: newFolder.toObject() };
});
const createFolder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, folderType, owner, parentFolder } = payload;
    const folderData = {
        name,
        folderType,
        owner,
        parentFolder: parentFolder ? new mongoose_1.Types.ObjectId(parentFolder) : null,
    };
    return yield folders_model_1.Folder.create(folderData);
});
const getFolder = (folderId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = yield folders_model_1.Folder.findOne({
        _id: new mongoose_1.Types.ObjectId(folderId),
        owner: userId,
        isDeleted: false,
    })
        .populate("files")
        .populate("subfolders")
        .lean();
    if (!folder) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Folder not found");
    }
    return folder;
});
const updateFolder = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderId, userId, updateData } = params;
    const updatePayload = {};
    if (updateData.name)
        updatePayload.name = updateData.name;
    if (updateData.parentFolder !== undefined) {
        updatePayload.parentFolder = updateData.parentFolder ? new mongoose_1.Types.ObjectId(updateData.parentFolder) : null;
    }
    const folder = yield folders_model_1.Folder.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(folderId), owner: userId }, updatePayload, { new: true })
        .populate("files")
        .populate("subfolders")
        .lean();
    if (!folder) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Folder not found");
    }
    return folder;
});
const deleteFolder = (folderId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = yield folders_model_1.Folder.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(folderId), owner: userId }, { isDeleted: true }, { new: true });
    if (!folder) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Folder not found");
    }
    return folder;
});
exports.FolderServices = { handleSecretFolder, createFolder, getFolder, updateFolder, deleteFolder };
