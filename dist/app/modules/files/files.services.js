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
exports.FileServices = void 0;
const mongoose_1 = require("mongoose");
const files_model_1 = require("./files.model");
const auth_model_1 = __importDefault(require("../auth/auth.model"));
const formatBytes_1 = require("../../utils/formatBytes");
const notesExt = ["txt", "doc", "docx", "rtf", "odt", "md"];
const imageExt = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "tif", "tiff", "heic", "avif"];
const pdfExt = ["pdf"];
const createFile = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return files_model_1.File.create(payload);
});
const getAllFiles = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {
        owner: query.owner,
        isDeleted: query.isDeleted,
    };
    filter.parentFolder = query.parentFolder ? new mongoose_1.Types.ObjectId(query.parentFolder) : { $exists: false };
    if (query.type) {
        const extArr = query.type === "notes" ? notesExt : query.type === "images" ? imageExt : pdfExt;
        filter.type = { $in: extArr };
    }
    const filesRaw = yield files_model_1.File.find(filter).sort({ createdAt: -1 }).populate("owner").exec();
    const files = filesRaw.map((f) => {
        const fileObj = f.toObject();
        if (fileObj.owner && typeof fileObj.owner.storageLimit === "number") {
            fileObj.owner.storageLimit = (0, formatBytes_1.formatBytes)(fileObj.owner.storageLimit);
        }
        if (fileObj.size && typeof fileObj.size === "number") {
            fileObj.size = (0, formatBytes_1.formatBytes)(fileObj.size);
        }
        return fileObj;
    });
    return files;
});
const getStorageSummary = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [{ total = 0 } = {}] = yield files_model_1.File.aggregate([{ $match: { owner: ownerId, isDeleted: false } }, { $group: { _id: null, total: { $sum: "$size" } } }]);
    const user = yield auth_model_1.default.findById(ownerId).select("storageLimit").lean();
    return { limit: (_a = user === null || user === void 0 ? void 0 : user.storageLimit) !== null && _a !== void 0 ? _a : 0, used: total };
});
const getCategorySummary = (owner) => __awaiter(void 0, void 0, void 0, function* () {
    const agg = yield files_model_1.File.aggregate([
        { $match: { owner, isDeleted: false } },
        {
            $project: {
                size: 1,
                category: {
                    $switch: {
                        branches: [
                            {
                                case: { $in: [{ $toLower: "$type" }, pdfExt] },
                                then: "pdf",
                            },
                            {
                                case: { $in: [{ $toLower: "$type" }, notesExt] },
                                then: "notes",
                            },
                            {
                                case: { $in: [{ $toLower: "$type" }, imageExt] },
                                then: "images",
                            },
                        ],
                        default: "other",
                    },
                },
            },
        },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                storage: { $sum: "$size" },
            },
        },
    ]);
    const summary = {
        notes: { count: 0, storage: 0 },
        images: { count: 0, storage: 0 },
        pdf: { count: 0, storage: 0 },
    };
    for (const row of agg) {
        if (row._id in summary) {
            summary[row._id] = {
                count: row.count,
                storage: row.storage,
            };
        }
    }
    return summary;
});
const toggleFavorite = (fileId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield files_model_1.File.findOne({ _id: fileId, owner: ownerId, isDeleted: false });
    if (!file)
        return null;
    file.favorite = !file.favorite;
    yield file.save();
    return file.toObject();
});
const getFavoriteFiles = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const filesRaw = yield files_model_1.File.find({
        owner: ownerId,
        isDeleted: false,
        favorite: true,
    })
        .sort({ createdAt: -1 })
        .populate("owner")
        .exec();
    const files = filesRaw.map((f) => {
        const fileObj = f.toObject();
        if (fileObj.owner && typeof fileObj.owner.storageLimit === "number") {
            fileObj.owner.storageLimit = (0, formatBytes_1.formatBytes)(fileObj.owner.storageLimit);
        }
        if (fileObj.size && typeof fileObj.size === "number") {
            fileObj.size = (0, formatBytes_1.formatBytes)(fileObj.size);
        }
        return fileObj;
    });
    return files;
});
const renameFile = (fileId, ownerId, newName) => __awaiter(void 0, void 0, void 0, function* () {
    return files_model_1.File.findOneAndUpdate({ _id: fileId, owner: ownerId, isDeleted: false }, { name: newName }, { new: true }).lean();
});
const getFilesByDateRange = (q) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {
        owner: q.owner,
        isDeleted: false,
    };
    if (q.start || q.end) {
        filter.createdAt = {};
        if (q.start)
            filter.createdAt.$gte = q.start;
        if (q.end)
            filter.createdAt.$lte = q.end;
    }
    const raw = yield files_model_1.File.find(filter).sort({ createdAt: -1 }).populate("owner").exec();
    return raw.map((f) => {
        const o = f.toObject();
        if (o.owner && typeof o.owner.storageLimit === "number") {
            o.owner.storageLimit = (0, formatBytes_1.formatBytes)(o.owner.storageLimit);
        }
        if (o.size && typeof o.size === "number") {
            o.size = (0, formatBytes_1.formatBytes)(o.size);
        }
        return o;
    });
});
exports.FileServices = {
    createFile,
    getAllFiles,
    getStorageSummary,
    getCategorySummary,
    toggleFavorite,
    getFavoriteFiles,
    renameFile,
    getFilesByDateRange,
};
