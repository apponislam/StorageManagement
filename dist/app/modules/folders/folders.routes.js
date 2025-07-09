"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const folders_validation_1 = require("./folders.validation");
const folders_controller_1 = require("./folders.controller");
const router = express_1.default.Router();
router.post("/secret", (0, auth_1.default)(), (0, validateRequest_1.default)(folders_validation_1.handleSecretFolderSchema), folders_controller_1.FolderController.handleSecretFolder);
router.post("/", (0, auth_1.default)(), (0, validateRequest_1.default)(folders_validation_1.createFolderSchema), folders_controller_1.FolderController.createFolder);
router.get("/:id", (0, auth_1.default)(), folders_controller_1.FolderController.getFolder);
router.patch("/:id", (0, auth_1.default)(), (0, validateRequest_1.default)(folders_validation_1.updateFolderSchema), folders_controller_1.FolderController.updateFolder);
router.delete("/:id", (0, auth_1.default)(), folders_controller_1.FolderController.deleteFolder);
exports.FolderRoutes = router;
