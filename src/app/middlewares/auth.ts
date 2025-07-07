import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import User from "../modules/auth/auth.model";
import { IJwtPayload } from "../modules/auth/auth.utils";

const auth = () => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers.authorization);
        const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

        console.log(token);

        if (!token) {
            sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: "You are not authorized",
                data: null,
            });
            return;
        }

        try {
            const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
            const { _id } = decoded;

            const user = await User.findById(_id);

            if (!user || user.isDeleted) {
                sendResponse(res, {
                    statusCode: httpStatus.UNAUTHORIZED,
                    success: false,
                    message: "User not found or account deleted",
                    data: null,
                });
                return;
            }

            req.user = decoded as IJwtPayload;
            next();
        } catch (err) {
            sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: "Invalid token",
                data: null,
            });
        }
    });
};

export default auth;
