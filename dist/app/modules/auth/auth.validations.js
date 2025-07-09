"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.resendOtpValidation = exports.verifyOtpValidation = exports.forgotPasswordValidation = exports.changePasswordValidation = exports.userUpdateValidation = exports.googleAuthValidation = exports.userLoginValidation = exports.userValidation = void 0;
const zod_1 = require("zod");
exports.userValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        username: zod_1.z.string({ required_error: "Username is required" }).min(3).max(50),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6).max(100).optional(), // Now optional
        authType: zod_1.z.enum(["email", "google"]).default("email"),
    })
        .refine((data) => {
        if (data.authType === "email") {
            return data.password !== undefined;
        }
        return true;
    }, {
        message: "Password is required for email authentication",
        path: ["password"],
    }),
});
exports.userLoginValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email address"),
        password: zod_1.z.string({ required_error: "Password is required" }),
    })
        .strict(),
});
exports.googleAuthValidation = zod_1.z.object({
    body: zod_1.z.object({
        googleId: zod_1.z.string({
            required_error: "Google ID is required",
        }),
        email: zod_1.z
            .string({
            required_error: "Email is required",
        })
            .email("Invalid email address"),
        username: zod_1.z
            .string({
            required_error: "Username is required",
        })
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username cannot exceed 50 characters"),
        photo: zod_1.z.string().url("Invalid photo URL").optional(),
    }),
});
exports.userUpdateValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        username: zod_1.z.string().min(3, "Username must be at least 3 characters").max(50, "Username cannot exceed 50 characters").optional(),
        email: zod_1.z.string().email("Invalid email address").optional(),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(100, "Password cannot exceed 100 characters").optional(),
        photo: zod_1.z.string().url("Invalid photo URL").optional(),
        isDeleted: zod_1.z.boolean().optional(),
    })
        .strict(),
});
exports.changePasswordValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        currentPassword: zod_1.z.string({
            required_error: "Current password is required",
        }),
        newPassword: zod_1.z
            .string({
            required_error: "New password is required",
        })
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password cannot exceed 100 characters"),
        confirmPassword: zod_1.z.string({
            required_error: "Confirm password is required",
        }),
    })
        .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
});
// Forgot Password
exports.forgotPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
    }),
});
exports.verifyOtpValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    }),
});
exports.resendOtpValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
    }),
});
exports.resetPasswordValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string().email("Invalid email address"),
        otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
        newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: zod_1.z.string(),
    })
        .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
});
exports.default = exports.userValidation;
