import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

import sendResponse from "../../utils/sendResponse";
import { UserService } from "./auth.services";
import config from "../../config";
import { prettifyName } from "../../utils/prettifyName";
import AppError from "../../errors/AppError";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const { password, confirmPassword, ...rest } = req.body;

    if (password !== confirmPassword) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Password and Confirm Password do not match",
            data: null,
        });
        return;
    }

    const result = await UserService.createUser(req.file, { password, ...rest });

    res.cookie("refreshToken", result.refreshToken, {
        secure: config.node_env === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User created successfully",
        data: result,
    });
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Google authentication failed");
    }

    const { googleId, email = "", photo = "", username = "" } = req.user as any;

    const { user, accessToken, refreshToken } = await UserService.googleSignService({
        id: googleId,
        email,
        name: username,
        photo,
    });

    res.cookie("refreshToken", refreshToken, {
        secure: config.node_env === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Google sign‑in successful",
        data: { user, accessToken, refreshToken },
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await UserService.loginUser(email, password);

    res.cookie("refreshToken", result.refreshToken, {
        secure: config.node_env === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: user not found",
            data: null,
        });
    }
    const userId = req.user!._id!;

    await UserService.deleteUser(userId);

    res.clearCookie("refreshToken");

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Account deleted successfully",
        data: null,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: "Unauthorized: user not found",
            data: null,
        });
    }

    const userId = req.user!._id!;
    const result = await UserService.changePassword(userId, currentPassword, newPassword);

    res.cookie("refreshToken", result.refreshToken, {
        secure: config.node_env === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

// Forgot Password

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await UserService.forgotPassword(email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "OTP sent to email",
        data: null,
    });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await UserService.verifyOtp(email, otp);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "OTP verified successfully",
        data: null,
    });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await UserService.resendOtp(email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New OTP sent to email",
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword, confirmPassword } = req.body;
    const tokens = await UserService.resetPassword(email, otp, newPassword, confirmPassword);

    res.cookie("refreshToken", tokens.refreshToken, {
        secure: config.node_env === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successful",
        data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
});

export const UserController = {
    createUser,
    googleCallback,
    loginUser,
    deleteUser,
    changePassword,
    forgotPassword,
    verifyOtp,
    resendOtp,
    resetPassword,
};
