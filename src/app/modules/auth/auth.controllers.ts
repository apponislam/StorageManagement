import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

import sendResponse from "../../utils/sendResponse";
import { UserService } from "./auth.services";
import config from "../../config";

const createUser = catchAsync(async (req: Request, res: Response) => {
    console.log(req.file);
    console.log(req.body);

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
    const userId = req.user._id;

    await UserService.deleteUser(userId);

    res.clearCookie("refreshToken");

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Account deleted successfully",
        data: null,
    });
});

export const UserController = {
    createUser,
    loginUser,
    deleteUser,
};
