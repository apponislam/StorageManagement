import { Schema, model } from "mongoose";
import { IFile } from "./files.interface";
import { formatBytes } from "../../utils/formatBytes";

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

fileSchema.methods.toJSON = function () {
    const file = this.toObject();
    if (file.size != null) {
        file.size = formatBytes(file.size);
    }
    return file;
};

// fileSchema.methods.toJSON = function () {
//     const file = this.toObject();
//     if (file.size != null) {
//         file.size = file.size / (1024 * 1024 * 1024);
//     }
//     return file;
// };

export const File = model<IFile>("File", fileSchema);
