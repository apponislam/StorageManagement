"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const mongoose_1 = require("mongoose");
const formatBytes_1 = require("../../utils/formatBytes");
const fileSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentFolder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Folder",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    secretFolder: {
        type: Boolean,
        default: false,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
fileSchema.pre(["find", "findOne"], function (next) {
    this.where({ isDeleted: false });
    next();
});
fileSchema.methods.toJSON = function () {
    const file = this.toObject();
    if (file.size != null) {
        file.size = (0, formatBytes_1.formatBytes)(file.size);
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
exports.File = (0, mongoose_1.model)("File", fileSchema);
