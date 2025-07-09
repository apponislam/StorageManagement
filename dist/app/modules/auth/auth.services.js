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
exports.UserService = void 0;
const config_1 = __importDefault(require("../../config"));
const sendImgToCloudinary_1 = require("../../utils/sendImgToCloudinary");
const auth_model_1 = require("./auth.model");
const auth_utils_1 = require("./auth.utils");
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../../utils/email");
// const FIFTEEN_GB_IN_BYTES = 15 * 1024 * 1024 * 1024;
const createUser = (file, userData) => __awaiter(void 0, void 0, void 0, function* () {
    if (file) {
        const now = new Date().toISOString().replace(/[:.]/g, "");
        const ext = path_1.default.extname(file.originalname);
        const base = path_1.default.basename(file.originalname, ext);
        const imageName = `${base}${ext}-${now}`;
        const mainpath = file === null || file === void 0 ? void 0 : file.path;
        const { secure_url } = yield (0, sendImgToCloudinary_1.sendImageToCloudinary)(imageName, mainpath);
        userData.photo = secure_url;
    }
    const result = yield auth_model_1.User.create(userData);
    const jwtPayload = {
        _id: result._id.toString(),
        username: result.username,
        email: result.email,
        photo: result.photo,
        isDeleted: result.isDeleted,
        storageLimit: result.storageLimit,
        authType: result.authType,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return { user: result, accessToken, refreshToken };
});
const FIFTEEN_GB = 15 * 1024 * 1024 * 1024;
const googleSignService = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield auth_model_1.User.findOne({
        $or: [{ googleId: profile.id }, { email: profile.email }],
    });
    if (!user) {
        const userData = {
            username: profile.name,
            email: profile.email,
            photo: profile.photo,
            isDeleted: false,
            storageLimit: FIFTEEN_GB,
            authType: "google",
            googleId: profile.id,
            password: undefined,
        };
        user = yield auth_model_1.User.create(userData);
    }
    else if (!user.googleId) {
        user.googleId = profile.id;
        user.authType = "both";
        yield user.save();
    }
    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            photo: user.photo,
            storageLimit: user.storageLimit,
            authType: user.authType,
        },
        accessToken,
        refreshToken,
    };
});
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findOne({ email }).select("+password +authType");
    if (!user) {
        throw new Error("User not found");
    }
    if (user.isDeleted) {
        throw new Error("This account has been deleted");
    }
    if (user.authType === "google") {
        throw new Error("Please sign in with Google");
    }
    const isPasswordMatched = yield auth_model_1.User.isPasswordMatched(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Incorrect password");
    }
    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return {
        accessToken,
        refreshToken,
    };
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_model_1.User.findByIdAndUpdate(userId, {
        isDeleted: true,
        $unset: {
            refreshToken: 1,
            accessToken: 1,
        },
    }, { new: true });
    return result;
});
const changePassword = (userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(userId).select("+password +authType");
    if (!user) {
        throw new Error("User not found");
    }
    if (user.isDeleted) {
        throw new Error("This account has been deleted");
    }
    if (user.authType === "google") {
        throw new Error("Google-authenticated users cannot change password");
    }
    const isPasswordMatched = yield auth_model_1.User.isPasswordMatched(currentPassword, user.password);
    if (!isPasswordMatched) {
        throw new Error("Current password is incorrect");
    }
    user.password = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user.save();
    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            photo: user.photo,
            storageLimit: user.storageLimit,
        },
        accessToken,
        refreshToken,
    };
});
// Forgot Password
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    if (user.authType === "google")
        throw new Error("Google users must use Google login");
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetPass = {
        passwordResetOTP: otp,
        passwordResetExpire: expiresAt,
    };
    yield user.save();
    yield (0, email_1.sendEmail)(email, "Password Reset OTP", `Your OTP code is: <strong>${otp}</strong><br>Valid for 10 minutes.`);
    return { email };
});
const verifyOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield auth_model_1.User.findOne({ email });
    if (!((_a = user === null || user === void 0 ? void 0 : user.resetPass) === null || _a === void 0 ? void 0 : _a.passwordResetOTP))
        throw new Error("OTP not found");
    if (user.resetPass.passwordResetOTP !== otp)
        throw new Error("Invalid OTP");
    if (user.resetPass.passwordResetExpire && user.resetPass.passwordResetExpire < new Date()) {
        throw new Error("OTP expired");
    }
    return { verified: true };
});
const resendOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return forgotPassword(email);
});
const resetPassword = (email, otp, newPassword, confirmPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
    }
    yield verifyOtp(email, otp);
    const user = yield auth_model_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    user.password = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    user.resetPass = undefined;
    yield user.save();
    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };
    return {
        accessToken: (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire),
        refreshToken: (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire),
    };
});
exports.UserService = {
    createUser,
    googleSignService,
    loginUser,
    deleteUser,
    changePassword,
    forgotPassword,
    verifyOtp,
    resendOtp,
    resetPassword,
};
