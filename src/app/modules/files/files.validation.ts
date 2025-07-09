import { z } from "zod";
import { Types } from "mongoose";

const mongoId = z.string({ required_error: "ID is required", invalid_type_error: "ID must be a string" }).refine((val) => Types.ObjectId.isValid(val), { message: "Invalid MongoDB ObjectId format" });

export const createFileSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "File name is required" }).min(1, "File name cannot be empty").max(255, "File name cannot exceed 255 characters"),

        path: z.string({ required_error: "File path is required" }).min(1, "File path cannot be empty"),

        size: z.number({ required_error: "File size is required" }).int("Size must be an integer").nonnegative("Size must be zero or positive"),

        type: z.string({ required_error: "File type is required" }).min(1, "File type cannot be empty"),

        owner: mongoId,
        parentFolder: mongoId.optional(),

        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        isDeleted: z.boolean().optional().default(false),
    }),
});

export const getFileSchema = z.object({
    params: z.object({ id: mongoId }),
});

export const updateFileSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255).optional(),
        path: z.string().min(1).optional(),
        size: z.number().int().nonnegative().optional(),
        type: z.string().min(1).optional(),
        owner: mongoId.optional(),
        parentFolder: mongoId.optional().nullable(),
        isDeleted: z.boolean().optional(),
    }),
});
