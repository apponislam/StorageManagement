import config from "../../config";
import { sendImageToCloudinary } from "../../utils/sendImgToCloudinary";
import { User } from "./auth.model";
import { createToken, IJwtPayload } from "./auth.utils";
import path from "path";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/email";
import { prettifyName } from "../../utils/prettifyName";

// const FIFTEEN_GB_IN_BYTES = 15 * 1024 * 1024 * 1024;

const createUser = async (file: any, userData: IUser) => {
    userData.username = prettifyName(userData.username);

    if (file) {
        const now = new Date().toISOString().replace(/[:.]/g, "");
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const imageName = `${base}${ext}-${now}`;
        const mainpath = file?.path;
        const { secure_url } = await sendImageToCloudinary(imageName, mainpath);
        userData.photo = secure_url as string;
    }

    const result = await User.create(userData);

    const jwtPayload: IJwtPayload = {
        _id: result._id.toString(),
        username: result.username, // Already formatted
        email: result.email,
        photo: result.photo,
        isDeleted: result.isDeleted,
        storageLimit: result.storageLimit,
        authType: result.authType,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expire as string);
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

    return { user: result, accessToken, refreshToken };
};

const FIFTEEN_GB = 15 * 1024 * 1024 * 1024;

const googleSignService = async (profile: { id: string; email: string; name: string; photo?: string }) => {
    let user = await User.findOne({
        $or: [{ googleId: profile.id }, { email: profile.email }],
    });

    if (!user) {
        const userData = {
            username: profile.name, // Already prettified in Passport
            email: profile.email,
            photo: profile.photo,
            isDeleted: false,
            storageLimit: FIFTEEN_GB,
            authType: "google",
            googleId: profile.id,
            password: undefined,
        };
        user = await User.create(userData);
    } else if (!user.googleId) {
        user.googleId = profile.id;
        user.authType = "both";
        await user.save();
    }

    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            photo: user.photo,
            storageLimit: user.storageLimit,
            authType: user.authType,
        },
        accessToken,
        refreshToken,
    };
};

const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email }).select("+password +authType");

    if (!user) {
        throw new Error("User not found");
    }

    if (user.isDeleted) {
        throw new Error("This account has been deleted");
    }

    if (user.authType === "google") {
        throw new Error("Please sign in with Google");
    }

    const isPasswordMatched = await User.isPasswordMatched(password, user.password!);
    if (!isPasswordMatched) {
        throw new Error("Incorrect password");
    }

    const jwtPayload: IJwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return {
        accessToken,
        refreshToken,
    };
};

const deleteUser = async (userId: string) => {
    const result = await User.findByIdAndUpdate(
        userId,
        {
            isDeleted: true,
            $unset: {
                refreshToken: 1,
                accessToken: 1,
            },
        },
        { new: true }
    );
    return result;
};

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await User.findById(userId).select("+password +authType");

    if (!user) {
        throw new Error("User not found");
    }

    if (user.isDeleted) {
        throw new Error("This account has been deleted");
    }

    if (user.authType === "google") {
        throw new Error("Google-authenticated users cannot change password");
    }

    const isPasswordMatched = await User.isPasswordMatched(currentPassword, user.password!);
    if (!isPasswordMatched) {
        throw new Error("Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
    await user.save();

    const jwtPayload: IJwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return {
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            photo: user.photo,
            storageLimit: user.storageLimit,
        },
        accessToken,
        refreshToken,
    };
};

// Forgot Password

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (email: string): Promise<{ email: string }> => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    if (user.authType === "google") throw new Error("Google users must use Google login");

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPass = {
        passwordResetOTP: otp,
        passwordResetExpire: expiresAt,
    };
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP code is: <strong>${otp}</strong><br>Valid for 10 minutes.`);

    return { email };
};

const verifyOtp = async (email: string, otp: string): Promise<{ verified: boolean }> => {
    const user = await User.findOne({ email });
    if (!user?.resetPass?.passwordResetOTP) throw new Error("OTP not found");
    if (user.resetPass.passwordResetOTP !== otp) throw new Error("Invalid OTP");
    if (user.resetPass.passwordResetExpire && user.resetPass.passwordResetExpire < new Date()) {
        throw new Error("OTP expired");
    }
    return { verified: true };
};

const resendOtp = async (email: string): Promise<{ email: string }> => {
    return forgotPassword(email);
};

const resetPassword = async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    await verifyOtp(email, otp);

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    user.password = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
    user.resetPass = undefined;
    await user.save();

    const jwtPayload = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photo: user.photo,
        isDeleted: user.isDeleted,
        storageLimit: user.storageLimit,
        authType: user.authType,
    };

    return {
        accessToken: createToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!),
        refreshToken: createToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!),
    };
};

export const UserService = {
    createUser,
    googleSignService,
    loginUser,
    deleteUser,
    changePassword,
    forgotPassword,
    verifyOtp,
    resendOtp,
    resetPassword,
};
