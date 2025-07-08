import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { FolderServices } from "./folders.services";
import { Types } from "mongoose";

const handleSecretFolder = catchAsync(async (req: Request, res: Response) => {
    const { pin, confirmPin } = req.body;
    const result = await FolderServices.handleSecretFolder({
        pin,
        confirmPin,
        owner: new Types.ObjectId(req.user!._id),
    });

    sendResponse(res, {
        statusCode: result.action === "created" ? httpStatus.CREATED : httpStatus.OK,
        success: true,
        message: result.action === "created" ? "Secret folder created successfully" : "Secret folder accessed successfully",
        data: result.folder,
    });
});

const createFolder = catchAsync(async (req: Request, res: Response) => {
    const { name, parentFolder } = req.body;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const folderType = "normal";

    const result = await FolderServices.createFolder({
        name,
        folderType,
        owner: new Types.ObjectId(req.user._id),
        parentFolder,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Folder created successfully",
        data: result,
    });
});

const getFolder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const result = await FolderServices.getFolder(id, new Types.ObjectId(req.user._id));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Folder retrieved successfully",
        data: result,
    });
});

const updateFolder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, parentFolder } = req.body;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    const result = await FolderServices.updateFolder({
        folderId: id,
        userId: new Types.ObjectId(req.user._id),
        updateData: { name, parentFolder },
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Folder updated successfully",
        data: result,
    });
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.user?._id) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: User not authenticated",
            data: null,
        });
    }

    await FolderServices.deleteFolder(id, new Types.ObjectId(req.user._id));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Folder deleted successfully",
        data: null,
    });
});

export const FolderController = {
    handleSecretFolder,
    createFolder,
    getFolder,
    updateFolder,
    deleteFolder,
};
