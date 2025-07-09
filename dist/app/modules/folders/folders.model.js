"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
const mongoose_1 = require("mongoose");
const folderSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
        trim: true,
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentFolder: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "File",
            default: [],
        },
    ],
    subfolders: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Folder",
            default: [],
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
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
exports.Folder = (0, mongoose_1.model)("Folder", folderSchema);
