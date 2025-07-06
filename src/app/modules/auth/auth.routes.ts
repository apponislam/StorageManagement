import express from "express";
import userValidation, { userUpdateValidation } from "./auth.validations";
import { UserController } from "./auth.controllers";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post("/", validateRequest(userValidation), UserController.createUser);

export const UserRoutes = router;
