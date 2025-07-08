import { Schema, model } from "mongoose";
import { IFolder } from "./folders.interface";

const folderSchema = new Schema<IFolder>(
    {
        name: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 100,
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
        folderType: {
            type: String,
            enum: ["normal", "secret"],
            default: "normal",
            required: true,
        },
        pin: {
            type: String,
            required() {
                return this.folderType === "secret";
            },
            select: false,
        },
        files: [
            {
                type: Schema.Types.ObjectId,
                ref: "File",
                default: [],
            },
        ],
        subfolders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Folder",
                default: [],
            },
        ],
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

folderSchema.pre(["find", "findOne"], function (next) {
    this.where({ isDeleted: false });
    next();
});

folderSchema.set("toJSON", {
    transform: (_, ret) => {
        delete ret.pin;
        return ret;
    },
});

export const Folder = model<IFolder>("Folder", folderSchema);
