import { Types } from "mongoose";
import { IFile } from "./files.interface";
import { File } from "./files.model";
import User from "../auth/auth.model";
import { formatBytes } from "../../utils/formatBytes";

const notesExt = ["txt", "doc", "docx", "rtf", "odt", "md"];
const imageExt = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "tif", "tiff", "heic", "avif"];
const pdfExt = ["pdf"];

const createFile = async (payload: Partial<IFile>): Promise<IFile> => {
    return File.create(payload);
};

interface FileQuery {
    owner: Types.ObjectId;
    parentFolder?: string;
    isDeleted: boolean;
    type?: "notes" | "images" | "pdf";
}

const getAllFiles = async (query: FileQuery): Promise<IFile[]> => {
    const filter: any = {
        owner: query.owner,
        isDeleted: query.isDeleted,
    };

    filter.parentFolder = query.parentFolder ? new Types.ObjectId(query.parentFolder) : { $exists: false };

    if (query.type) {
        const extArr = query.type === "notes" ? notesExt : query.type === "images" ? imageExt : pdfExt;
        filter.type = { $in: extArr };
    }

    const filesRaw = await File.find(filter).sort({ createdAt: -1 }).populate("owner").exec();

    const files = filesRaw.map((f: any) => {
        const fileObj = f.toObject();

        if (fileObj.owner && typeof fileObj.owner.storageLimit === "number") {
            fileObj.owner.storageLimit = formatBytes(fileObj.owner.storageLimit);
        }
        if (fileObj.size && typeof fileObj.size === "number") {
            fileObj.size = formatBytes(fileObj.size);
        }
        return fileObj;
    });

    return files;
};

const getStorageSummary = async (ownerId: Types.ObjectId): Promise<{ limit: number; used: number }> => {
    const [{ total = 0 } = {}] = await File.aggregate([{ $match: { owner: ownerId, isDeleted: false } }, { $group: { _id: null, total: { $sum: "$size" } } }]);

    const user = await User.findById(ownerId).select("storageLimit").lean();
    return { limit: user?.storageLimit ?? 0, used: total };
};

const getCategorySummary = async (owner: Types.ObjectId) => {
    const agg = await File.aggregate([
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

    const summary: Record<"notes" | "images" | "pdf", { count: number; storage: number }> = {
        notes: { count: 0, storage: 0 },
        images: { count: 0, storage: 0 },
        pdf: { count: 0, storage: 0 },
    };

    for (const row of agg) {
        if (row._id in summary) {
            summary[row._id as "notes" | "images" | "pdf"] = {
                count: row.count,
                storage: row.storage,
            };
        }
    }

    return summary;
};

export const FileServices = {
    createFile,
    getAllFiles,
    getStorageSummary,
    getCategorySummary,
};
