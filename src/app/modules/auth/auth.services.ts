import config from "../../config";
import { sendImageToCloudinary } from "../../utils/sendImgToCloudinary";
import { User } from "./auth.model";
import { createToken, IJwtPayload } from "./auth.utils";
import path from "path";

const createUser = async (file: any, userData: IUser) => {
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
        username: result.username,
        email: result.email,
        photo: result.photo,
        isDeleted: result.isDeleted,
        storageLimit: result.storageLimit,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expire as string);

    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

    return { user: result, accessToken, refreshToken };
};

const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    if (user.isDeleted) {
        throw new Error("This account has been deleted");
    }

    const isPasswordMatched = await User.isPasswordMatched(password, user.password);

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
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expire as string);
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

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

export const UserService = {
    createUser,
    loginUser,
    deleteUser,
};
