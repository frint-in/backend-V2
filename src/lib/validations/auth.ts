import { z } from "zod";


export const signUpSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().min(2, { message: "email is too short" }).email({ message: "Invalid email address" }),
    password: z.string().min(10, "Password must be at least 10 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
})


export const signInSchema = z.object({

    email: z.string().min(2, { message: "email is too short" }).email({ message: "Invalid email address" }),
    password: z.string().min(10, "Password must be at least 10 characters"),
});


// export const userSchema = z.object({
//     _id: z.string(),
//     firstName: z.string(),
//     lastName: z.string(),
//     email: z.string().min(2, { message: "email is too short" }).email({ message: "Invalid email address" }),
//     password: z.string().min(10, "Password must be at least 10 characters"),

// })



export type TSignup = z.infer<typeof signUpSchema>;
export type TSignin = z.infer<typeof signInSchema>;
// export type UserType = z.infer<typeof userSchema>;