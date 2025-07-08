import { z } from "zod";
import { Types } from "mongoose";

const mongoId = z
    .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
    })
    .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid MongoDB ObjectId format",
    });

const pinSchema = z
    .string({
        required_error: "PIN is required",
        invalid_type_error: "PIN must be a string",
    })
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^[0-9]{4}$/, "PIN must contain only numbers (0-9)");

export const handleSecretFolderSchema = z.object({
    body: z
        .object({
            pin: pinSchema,
            confirmPin: pinSchema.optional(),
        })
        .superRefine((body, ctx) => {
            if (body.confirmPin !== undefined && body.confirmPin !== body.pin) {
                ctx.addIssue({
                    path: ["confirmPin"],
                    code: z.ZodIssueCode.custom,
                    message: "PIN and Confirm PIN must match",
                });
            }
        }),
});

export const createFolderSchema = z.object({
    body: z
        .object({
            name: z
                .string({
                    required_error: "Folder name is required",
                })
                .min(1, "Folder name cannot be empty")
                .max(100, "Folder name cannot exceed 100 characters"),

            parentFolder: mongoId.optional(),
            folderType: z
                .enum(["normal", "secret"], {
                    required_error: "Folder type must be either 'normal' or 'secret'",
                })
                .default("normal"),
            pin: pinSchema.optional(),
            files: z.array(mongoId).optional().default([]),
            subfolders: z.array(mongoId).optional().default([]),
            isDeleted: z.boolean().optional().default(false),
        })
        .refine((data) => data.folderType !== "secret" || data.pin !== undefined, {
            message: "4-digit PIN is required when folder type is 'secret'",
            path: ["pin"],
        }),
});

export const accessSecretFolderSchema = z.object({
    params: z.object({ id: mongoId }),
    body: z.object({ pin: pinSchema }),
});

export const updateFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        parentFolder: z.string().nullable().optional(),
    }),
});
