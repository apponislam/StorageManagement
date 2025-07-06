import { Model, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";

interface IUser {
    username: string;
    email: string;
    password: string;
    photo?: string;
    isDeleted: boolean;
}

interface UserModel extends Model<IUser> {
    isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}

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
    next();
});

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

userSchema.statics.isPasswordMatched = async function (plainTextPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<IUser, UserModel>("User", userSchema);
export default User;
