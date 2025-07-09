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
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const auth_model_1 = __importDefault(require("../modules/auth/auth.model"));
const auth = () => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // console.log(req.headers.authorization);
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\s+/i, "");
        // console.log(token);
        if (!token) {
            (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.UNAUTHORIZED,
                success: false,
                message: "You are not authorized",
                data: null,
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
            const { _id } = decoded;
            const user = yield auth_model_1.default.findById(_id);
            if (!user || user.isDeleted) {
                (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.UNAUTHORIZED,
                    success: false,
                    message: "User not found or account deleted",
                    data: null,
                });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.UNAUTHORIZED,
                success: false,
                message: "Invalid token",
                data: null,
            });
        }
    }));
};
exports.default = auth;
