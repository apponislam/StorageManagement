import express from "express";
import userValidation, { userLoginValidation } from "./auth.validations";
import { UserController } from "./auth.controllers";
import validateRequest from "../../middlewares/validateRequest";
import { upload } from "../../utils/sendImgToCloudinary";
import { parseJsonField } from "../../middlewares/parseJsonField";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/register", upload.single("file"), parseJsonField("data"), validateRequest(userValidation), UserController.createUser);

router.post("/login", validateRequest(userLoginValidation), UserController.loginUser);

router.delete("/delete", auth(), UserController.deleteUser);

export const UserRoutes = router;
