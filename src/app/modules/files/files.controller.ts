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
        type: req.query.type as "notes" | "images" | "pdf" | undefined,
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

const toggleFavoriteStatus = catchAsync(async (req, res) => {
    const { fileId } = req.params;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const updatedFile = await FileServices.toggleFavorite(fileId, new Types.ObjectId(req.user._id));

    if (!updatedFile) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorite status toggled successfully",
        data: updatedFile,
    });
});

const getFavorites = catchAsync(async (req, res) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const files = await FileServices.getFavoriteFiles(new Types.ObjectId(req.user._id));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorite files retrieved successfully",
        data: files,
    });
});

const renameFileController = catchAsync(async (req, res) => {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    if (!name || name.trim() === "") {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "New name is required",
            data: null,
        });
    }

    const updatedFile = await FileServices.renameFile(fileId, new Types.ObjectId(req.user._id), name.trim());

    if (!updatedFile) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "File renamed successfully",
        data: updatedFile,
    });
});

const getFilesByDate = catchAsync(async (req, res) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const { start, end } = req.query;

    const startDate = start ? new Date(start as string) : undefined;
    const endDate = end ? new Date(end as string) : undefined;

    if ((start && isNaN(startDate!.valueOf())) || (end && isNaN(endDate!.valueOf()))) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Invalid date format. Use ISO (YYYY‑MM‑DD).",
            data: null,
        });
    }

    const files = await FileServices.getFilesByDateRange({
        owner: new Types.ObjectId(req.user._id),
        start: startDate,
        end: endDate,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Files retrieved successfully",
        data: files,
    });
});

const duplicateFile = catchAsync(async (req, res) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }

    const newFile = await FileServices.duplicateFile(req.params.fileId, new Types.ObjectId(req.user._id));

    if (!newFile) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "File not found or you do not have permission",
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "File duplicated successfully",
        data: newFile,
    });
});

const copyToFolder = catchAsync(async (req, res) => {
    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }

    const { fileId, folderId } = req.params;

    const newFile = await FileServices.copyFileToFolder(fileId, new Types.ObjectId(req.user._id), new Types.ObjectId(folderId));

    if (!newFile) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "File or destination folder not found / no permission",
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "File copied to folder successfully",
        data: newFile,
    });
});

export const FileController = {
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
};
