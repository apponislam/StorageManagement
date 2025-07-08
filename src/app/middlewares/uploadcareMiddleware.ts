import { RequestHandler } from "express";
import { sendFileToUploadcare } from "../utils/uploadcare";

declare global {
    namespace Express {
        interface Request {
            ucFile?: Awaited<ReturnType<typeof sendFileToUploadcare>>;
        }
    }
}

export const uploadcareMiddleware: RequestHandler = async (req, res, next) => {
    if (!req.file) {
        res.status(400).json({ error: "No file provided" });
    }

    try {
        // console.log("→ After Multer:", req.file);

        if (!req.file) {
            return next(new Error("No file provided"));
        }

        const ucFile = await sendFileToUploadcare(req?.file?.originalname, req?.file.path);

        // console.log("→ After Uploadcare:", ucFile);

        req.ucFile = ucFile;
        next();
    } catch (err) {
        next(err);
    }
};
