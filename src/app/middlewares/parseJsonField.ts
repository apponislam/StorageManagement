import { Request, Response, NextFunction } from "express";
export const parseJsonField =
    (field = "data") =>
    (req: Request, res: Response, next: NextFunction) => {
        const raw = req.body?.[field];

        if (!raw) return next();

        try {
            req.body = JSON.parse(raw);
            next();
        } catch {
            res.status(400).json({
                success: false,
                message: `"${field}" must be valid JSON`,
            });
        }
    };
