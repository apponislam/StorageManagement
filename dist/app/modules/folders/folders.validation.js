"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFolderSchema = exports.accessSecretFolderSchema = exports.createFolderSchema = exports.handleSecretFolderSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const mongoId = zod_1.z
    .string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
})
    .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
});
const pinSchema = zod_1.z
    .string({
    required_error: "PIN is required",
    invalid_type_error: "PIN must be a string",
})
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^[0-9]{4}$/, "PIN must contain only numbers (0-9)");
exports.handleSecretFolderSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        pin: pinSchema,
        confirmPin: pinSchema.optional(),
    })
        .superRefine((body, ctx) => {
        if (body.confirmPin !== undefined && body.confirmPin !== body.pin) {
            ctx.addIssue({
                path: ["confirmPin"],
                code: zod_1.z.ZodIssueCode.custom,
                message: "PIN and Confirm PIN must match",
            });
        }
    }),
});
exports.createFolderSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z
            .string({
            required_error: "Folder name is required",
        })
            .min(1, "Folder name cannot be empty")
            .max(100, "Folder name cannot exceed 100 characters"),
        parentFolder: mongoId.optional(),
        folderType: zod_1.z
            .enum(["normal", "secret"], {
            required_error: "Folder type must be either 'normal' or 'secret'",
        })
            .default("normal"),
        pin: pinSchema.optional(),
        files: zod_1.z.array(mongoId).optional().default([]),
        subfolders: zod_1.z.array(mongoId).optional().default([]),
        isDeleted: zod_1.z.boolean().optional().default(false),
    })
        .refine((data) => data.folderType !== "secret" || data.pin !== undefined, {
        message: "4-digit PIN is required when folder type is 'secret'",
        path: ["pin"],
    }),
});
exports.accessSecretFolderSchema = zod_1.z.object({
    params: zod_1.z.object({ id: mongoId }),
    body: zod_1.z.object({ pin: pinSchema }),
});
exports.updateFolderSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        parentFolder: zod_1.z.string().nullable().optional(),
    }),
});
