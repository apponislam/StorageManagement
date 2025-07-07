import { z } from "zod";

export const userValidation = z.object({
    body: z
        .object({
            username: z.string({ required_error: "Username is required" }).min(3).max(50),
            email: z.string().email("Invalid email address"),
            password: z.string().min(6).max(100).optional(), // Now optional
            authType: z.enum(["email", "google"]).default("email"),
        })
        .refine(
            (data) => {
                if (data.authType === "email") {
                    return data.password !== undefined;
                }
                return true;
            },
            {
                message: "Password is required for email authentication",
                path: ["password"],
            }
        ),
});

export const userLoginValidation = z.object({
    body: z
        .object({
            email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
            password: z.string({ required_error: "Password is required" }),
        })
        .strict(),
});

export const googleAuthValidation = z.object({
    body: z.object({
        googleId: z.string({
            required_error: "Google ID is required",
        }),
        email: z
            .string({
                required_error: "Email is required",
            })
            .email("Invalid email address"),
        username: z
            .string({
                required_error: "Username is required",
            })
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username cannot exceed 50 characters"),
        photo: z.string().url("Invalid photo URL").optional(),
    }),
});

export const userUpdateValidation = z.object({
    body: z
        .object({
            username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username cannot exceed 50 characters").optional(),
            email: z.string().email("Invalid email address").optional(),
            password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password cannot exceed 100 characters").optional(),
            photo: z.string().url("Invalid photo URL").optional(),
            isDeleted: z.boolean().optional(),
        })
        .strict(),
});

export const changePasswordValidation = z.object({
    body: z
        .object({
            currentPassword: z.string({
                required_error: "Current password is required",
            }),
            newPassword: z
                .string({
                    required_error: "New password is required",
                })
                .min(6, "Password must be at least 6 characters")
                .max(100, "Password cannot exceed 100 characters"),
            confirmPassword: z.string({
                required_error: "Confirm password is required",
            }),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"],
        }),
});

// Forgot Password

export const forgotPasswordValidation = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
});

export const verifyOtpValidation = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        otp: z.string().length(6, "OTP must be 6 digits"),
    }),
});

export const resendOtpValidation = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
});

export const resetPasswordValidation = z.object({
    body: z
        .object({
            email: z.string().email("Invalid email address"),
            otp: z.string().length(6, "OTP must be 6 digits"),
            newPassword: z.string().min(6, "Password must be at least 6 characters"),
            confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"],
        }),
});

export default userValidation;
