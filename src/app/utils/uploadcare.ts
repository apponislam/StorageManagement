import { UploadClient, type UploadcareFile } from "@uploadcare/upload-client";
import fs from "fs/promises";
import multer from "multer";
import config from "../config";

const uploadClient = new UploadClient({
    publicKey: config.uploadcare_public_key as string,
});

export const sendFileToUploadcare = async (fileName: string, localPath: string): Promise<UploadcareFile> => {
    try {
        const buffer = await fs.readFile(localPath);
        const file = await uploadClient.uploadFile(buffer, { fileName, store: true });
        await fs.unlink(localPath).catch(() => {});
        return file;
    } catch (err) {
        await fs.unlink(localPath).catch(() => {});
        throw err;
    }
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, `${process.cwd()}/uploads/`);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${unique}`);
    },
});

export const upload = multer({ storage });

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
