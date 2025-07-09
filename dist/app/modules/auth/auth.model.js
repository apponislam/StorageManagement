"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const FIFTEEN_GB_IN_BYTES = 15 * 1024 * 1024 * 1024;
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [50, "Username cannot exceed 50 characters"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return this.authType === "email";
        },
        minlength: [6, "Password must be at least 6 characters"],
        maxlength: [100, "Password cannot exceed 100 characters"],
        select: false,
    },
    authType: {
        type: String,
        enum: ["email", "google"],
        default: "email",
        required: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    photo: {
        type: String,
        default: "",
        validate: {
            validator: (v) => {
                if (v)
                    return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
                return true;
            },
            message: "Invalid photo URL",
        },
    },
    storageLimit: {
        type: Number,
        default: FIFTEEN_GB_IN_BYTES,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    resetPass: {
        type: {
            passwordResetOTP: { type: String },
            passwordResetExpire: { type: Date },
        },
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.pre(["find", "findOne"], function (next) {
    if (this.getFilter().isDeleted == null) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.authType === "email" && this.isModified("password")) {
            this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        }
        next();
    });
});
const formatBytes = (bytes) => {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
};
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    if (user.storageLimit != null) {
        user.storageLimit = formatBytes(user.storageLimit);
    }
    return user;
};
// userSchema.methods.toJSON = function () {
//     const user = this.toObject();
//     delete user.password;
//     if (user.storageLimit != null) {
//         user.storageLimit = user.storageLimit / (1024 * 1024 * 1024);
//     }
//     return user;
// };
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        if (ret.storageLimit != null) {
            ret.storageLimit = ret.storageLimit / (1024 * 1024 * 1024);
        }
        return ret;
    },
});
exports.User = (0, mongoose_1.model)("User", userSchema);
exports.default = exports.User;
