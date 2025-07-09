"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_validations_1 = __importStar(require("./auth.validations"));
const auth_controllers_1 = require("./auth.controllers");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const sendImgToCloudinary_1 = require("../../utils/sendImgToCloudinary");
const parseJsonField_1 = require("../../middlewares/parseJsonField");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const passport_1 = __importDefault(require("../../config/passport"));
const router = express_1.default.Router();
router.post("/register", sendImgToCloudinary_1.upload.single("file"), (0, parseJsonField_1.parseJsonField)("data"), (0, validateRequest_1.default)(auth_validations_1.default), auth_controllers_1.UserController.createUser);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), auth_controllers_1.UserController.googleCallback);
router.post("/login", (0, validateRequest_1.default)(auth_validations_1.userLoginValidation), auth_controllers_1.UserController.loginUser);
router.delete("/delete", (0, auth_1.default)(), auth_controllers_1.UserController.deleteUser);
router.patch("/change-password", (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validations_1.changePasswordValidation), auth_controllers_1.UserController.changePassword);
router.post("/forgot-password", (0, validateRequest_1.default)(auth_validations_1.forgotPasswordValidation), auth_controllers_1.UserController.forgotPassword);
router.post("/verify-otp", (0, validateRequest_1.default)(auth_validations_1.verifyOtpValidation), auth_controllers_1.UserController.verifyOtp);
router.post("/resend-otp", (0, validateRequest_1.default)(auth_validations_1.resendOtpValidation), auth_controllers_1.UserController.resendOtp);
router.post("/reset-password", (0, validateRequest_1.default)(auth_validations_1.resetPasswordValidation), auth_controllers_1.UserController.resetPassword);
exports.UserRoutes = router;
