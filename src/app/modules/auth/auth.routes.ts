import express from "express";
import userValidation, { changePasswordValidation, forgotPasswordValidation, googleAuthValidation, resendOtpValidation, resetPasswordValidation, userLoginValidation, verifyOtpValidation } from "./auth.validations";
import { UserController } from "./auth.controllers";
import validateRequest from "../../middlewares/validateRequest";
import { upload } from "../../utils/sendImgToCloudinary";
import { parseJsonField } from "../../middlewares/parseJsonField";
import auth from "../../middlewares/auth";
import passport from "../../config/passport";

const router = express.Router();

router.post("/register", upload.single("file"), parseJsonField("data"), validateRequest(userValidation), UserController.createUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), UserController.googleCallback);

router.post("/login", validateRequest(userLoginValidation), UserController.loginUser);

router.delete("/delete", auth(), UserController.deleteUser);

router.patch("/change-password", auth(), validateRequest(changePasswordValidation), UserController.changePassword);

router.post("/forgot-password", validateRequest(forgotPasswordValidation), UserController.forgotPassword);
router.post("/verify-otp", validateRequest(verifyOtpValidation), UserController.verifyOtp);
router.post("/resend-otp", validateRequest(resendOtpValidation), UserController.resendOtp);
router.post("/reset-password", validateRequest(resetPasswordValidation), UserController.resetPassword);

export const UserRoutes = router;
