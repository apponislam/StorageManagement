import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IFile } from "./files.interface";
import { FileServices } from "./files.services";
import { formatBytes } from "../../utils/formatBytes";

const createFile = catchAsync(async (req: Request, res: Response) => {
    const { ucFile } = req;

    console.log("user", req.user?._id);
    console.log("ucFile", ucFile);

    if (!req.user?._id || !ucFile) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Missing user or file",
            data: null,
        });
    }

    const originalFilename = ucFile.originalFilename ?? ucFile.name;
    const ext = (originalFilename.split(".").pop() || "").toLowerCase();
    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    const generatedName = `${baseName}_${Date.now()}`;
    const fileUrl = `${ucFile.cdnUrl}${originalFilename}`;

    const newFile: Partial<IFile> = {
        name: generatedName,
        path: fileUrl,
        size: ucFile.size,
        type: ext,
        owner: new Types.ObjectId(req.user._id),
        parentFolder: req.body.parentFolder ? new Types.ObjectId(req.body.parentFolder) : undefined,
        isDeleted: false,
    };

    const result = await FileServices.createFile(newFile);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "File uploaded successfully",
        data: result,
    });
});

const getAllFiles = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const files = await FileServices.getAllFiles({
        owner: new Types.ObjectId(req.user._id),
        parentFolder: req.query.parentFolder as string | undefined,
        isDeleted: false,
        type: req.query.type as "notes" | "images" | "pdf" | undefined, // ⇦ NEW
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Files retrieved successfully",
        data: files,
    });
});

const getStorageSummary = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const { limit, used } = await FileServices.getStorageSummary(new Types.ObjectId(req.user._id));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Storage summary retrieved",
        data: {
            storageLimit: formatBytes(limit),
            usageStorage: formatBytes(used),
        },
    });
});

const getCategorySummary = catchAsync(async (req, res) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }

    const raw = await FileServices.getCategorySummary(new Types.ObjectId(req.user._id));

    const data = {
        notes: { count: raw.notes.count, storage: formatBytes(raw.notes.storage) },
        images: { count: raw.images.count, storage: formatBytes(raw.images.storage) },
        pdf: { count: raw.pdf.count, storage: formatBytes(raw.pdf.storage) },
    };

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "File type summary",
        data,
    });
});

export const FileController = {
    createFile,
    getAllFiles,
    getStorageSummary,
    getCategorySummary,
};
