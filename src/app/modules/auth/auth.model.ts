import { Model, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";

interface UserModel extends Model<IUser> {
    isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}

const FIFTEEN_GB_IN_BYTES = 15 * 1024 * 1024 * 1024;

const userSchema = new Schema<IUser, UserModel>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [50, "Username cannot exceed 50 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            maxlength: [100, "Password cannot exceed 100 characters"],
            select: false,
        },

        photo: {
            type: String,
            default: "",
            validate: {
                validator: (v: string) => {
                    if (v) return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
                    return true;
                },
                message: "Invalid photo URL",
            },
        },
        storageLimit: {
            type: Number,
            default: FIFTEEN_GB_IN_BYTES,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.pre(["find", "findOne"], function (next) {
    if (this.getFilter().isDeleted == null) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
    this.storageLimit = FIFTEEN_GB_IN_BYTES;
    next();
});

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    if (user.storageLimit != null) {
        user.storageLimit = user.storageLimit / (1024 * 1024 * 1024);
    }
    return user;
};

userSchema.statics.isPasswordMatched = async function (plainTextPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        if (ret.storageLimit != null) {
            ret.storageLimit = ret.storageLimit / (1024 * 1024 * 1024);
        }
        return ret;
    },
});

export const User = model<IUser, UserModel>("User", userSchema);
export default User;
