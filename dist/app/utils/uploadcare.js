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
exports.upload = exports.sendFileToUploadcare = void 0;
const upload_client_1 = require("@uploadcare/upload-client");
const promises_1 = __importDefault(require("fs/promises"));
const multer_1 = __importDefault(require("multer"));
const config_1 = __importDefault(require("../config"));
const uploadClient = new upload_client_1.UploadClient({
    publicKey: config_1.default.uploadcare_public_key,
});
const sendFileToUploadcare = (fileName, localPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buffer = yield promises_1.default.readFile(localPath);
        const file = yield uploadClient.uploadFile(buffer, { fileName, store: true });
        yield promises_1.default.unlink(localPath).catch(() => { });
        return file;
    }
    catch (err) {
        yield promises_1.default.unlink(localPath).catch(() => { });
        throw err;
    }
});
exports.sendFileToUploadcare = sendFileToUploadcare;
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, `${process.cwd()}/uploads/`);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${unique}`);
    },
});
exports.upload = (0, multer_1.default)({ storage });
// → After Multer: {
//     fieldname: 'file',
//     originalname: 'rsz_whatsapp_image_2025-06-24_at_214144_b67fb0e6_1-removebg-preview.png',
//     encoding: '7bit',
//     mimetype: 'image/png',
//     destination: 'E:\\Job Task\\Sparktech Agency\\Storage Management/uploads/',
//     filename: 'file-1752002261984-813780303',
//     path: 'E:\\Job Task\\Sparktech Agency\\Storage Management\\uploads\\file-1752002261984-813780303',
//     size: 48908
//   }
//   → After Uploadcare: UploadcareFile {
//     uuid: 'be7cc9d4-e860-4a8f-a6cc-ff6e49ad8c27',
//     name: 'rsz_whatsapp_image_20250624_at_214144_b67fb0e6_1removebgpreview.png',
//     size: 48908,
//     isStored: true,
//     isImage: true,
//     mimeType: 'application/octet-stream',
//     cdnUrl: 'https://ucarecdn.com/be7cc9d4-e860-4a8f-a6cc-ff6e49ad8c27/',
//     s3Url: null,
//     originalFilename: 'rsz_whatsapp_image_2025-06-24_at_214144_b67fb0e6_1-removebg-preview.png',
//     imageInfo: {
//       dpi: null,
//       width: 250,
//       format: 'PNG',
//       height: 250,
//       sequence: false,
//       colorMode: 'RGBA',
//       orientation: null,
//       geoLocation: null,
//       datetimeOriginal: null
//     },
//     videoInfo: null,
//     contentInfo: {
//       mime: { mime: 'image/png', type: 'image', subtype: 'png' },
//       image: {
//         dpi: null,
//         width: 250,
//         format: 'PNG',
//         height: 250,
//         sequence: false,
//         colorMode: 'RGBA',
//         orientation: null,
//         geoLocation: null,
//         datetimeOriginal: null
//       }
//     },
//     metadata: {},
//     s3Bucket: null,
//     defaultEffects: null
//   }
