interface IUser {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    photo?: string;
    isDeleted: boolean;
    storageLimit: number;
    authType: "email" | "google" | "both";
    googleId?: string;
    resetPass?: {
        passwordResetOTP?: string;
        passwordResetExpire?: Date;
    };
}
