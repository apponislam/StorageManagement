import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

import sendResponse from "../../utils/sendResponse";
import { UserService } from "./auth.services";

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

    const result = await UserService.createUser({ password, ...rest });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User created successfully",
        data: result,
    });
});

export const UserController = {
    createUser,
};
