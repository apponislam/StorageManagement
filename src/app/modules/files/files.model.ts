// src/modules/files/files.model.ts
import { Schema, model } from "mongoose";
import { IFile } from "./files.interface";

const fileSchema = new Schema<IFile>(
    {
        name: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255,
            trim: true,
        },
        path: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,
        },
        size: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        parentFolder: {
            type: Schema.Types.ObjectId,
            ref: "Folder",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

fileSchema.pre(["find", "findOne"], function (next) {
    this.where({ isDeleted: false });
    next();
});

export const File = model<IFile>("File", fileSchema);
