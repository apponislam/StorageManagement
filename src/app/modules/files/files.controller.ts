// src/modules/files/file.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { Types } from "mongoose";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IFile } from "./files.interface";
import { FileServices } from "./files.services";

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

export const FileController = {
    createFile,
};
