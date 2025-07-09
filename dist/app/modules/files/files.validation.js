"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFileSchema = exports.getFileSchema = exports.createFileSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const mongoId = zod_1.z.string({ required_error: "ID is required", invalid_type_error: "ID must be a string" }).refine((val) => mongoose_1.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ObjectId format" });
exports.createFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "File name is required" }).min(1, "File name cannot be empty").max(255, "File name cannot exceed 255 characters"),
        path: zod_1.z.string({ required_error: "File path is required" }).min(1, "File path cannot be empty"),
        size: zod_1.z.number({ required_error: "File size is required" }).int("Size must be an integer").nonnegative("Size must be zero or positive"),
        type: zod_1.z.string({ required_error: "File type is required" }).min(1, "File type cannot be empty"),
        owner: mongoId,
        parentFolder: mongoId.optional(),
        createdAt: zod_1.z.date().optional(),
        updatedAt: zod_1.z.date().optional(),
        isDeleted: zod_1.z.boolean().optional().default(false),
    }),
});
exports.getFileSchema = zod_1.z.object({
    params: zod_1.z.object({ id: mongoId }),
});
exports.updateFileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(255).optional(),
        path: zod_1.z.string().min(1).optional(),
        size: zod_1.z.number().int().nonnegative().optional(),
        type: zod_1.z.string().min(1).optional(),
        owner: mongoId.optional(),
        parentFolder: mongoId.optional().nullable(),
        isDeleted: zod_1.z.boolean().optional(),
    }),
});
