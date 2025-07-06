import { z } from "zod";

const userValidation = z.object({
    body: z.object({
        username: z
            .string({
                required_error: "Username is required",
            })
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username cannot exceed 50 characters"),

        email: z
            .string({
                required_error: "Email is required",
            })
            .email("Invalid email address"),

        password: z
            .string({
                required_error: "Password is required",
            })
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password cannot exceed 100 characters"),
        confirmPassword: z.string({
            required_error: "Confirm password is required",
        }),
        photo: z.string().url("Invalid photo URL").optional(),

        isDeleted: z.boolean().default(false),
    }),
});

export const userLoginValidation = z.object({
    body: z
        .object({
            email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
            password: z.string({ required_error: "Password is required" }),
        })
        .strict(),
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

export default userValidation;
