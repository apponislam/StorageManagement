import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface IJwtPayload {
    _id: string;
    username: string;
    email: string;
    photo?: string;
    isDeleted: boolean;
    storageLimit: number;
    authType: "email" | "google" | "both";
}

export const createToken = (jwtPayload: IJwtPayload, secret: string, expiresIn: string) => {
    return jwt.sign(jwtPayload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret) as JwtPayload;
};
