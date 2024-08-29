import { z } from "zod";


export const organizationSchema = z.object({
    org_name: z.string().min(1, "Organization name is required."),
    org_email: z.string().email("Invalid email address."),
    org_description: z.string().min(1, "Organization description is required."),
    org_website: z.string().min(3).url("Invalid URL.").optional(),
    org_categories: z.array(z.string().min(1, "Category cannot be empty.")).min(1, "At least one category is required."),
    org_location: z.string().min(1, "Location is required."),
    org_phono: z.number().int().positive("Phone number must be a positive integer."),
    org_type: z.enum(['non-profit', 'for-profit', 'government', 'educational']),
    org_logo: z.string(), //optional
    org_isGoogleUser: z.boolean(), //optional
    org_refreshToken: z.string(),  //optional
    org_password: z.string().min(10, "Password must be at least 10 characters"), //optional
    org_social_media: z.array(
      z.object({
        platform: z.string().min(1, "Platform name is required."),
        link: z.string().url("Invalid social media link."),
      })
    ).min(1, "At least one social media link is required."),
    org_establish: z.number().min(1000, "Year must be a four-digit number.").max(new Date().getFullYear(), "Year cannot be in the future."),
    isVerified: z.boolean(),
    verifyToken: z.string(), // Add token field
    verifyTokenExpiry: z.date() // Add token expiry field
  }).strict();



export const organisationPartialSchema = organizationSchema.partial();




export const orgSignupSchema = organizationSchema.extend({org_confirmPassword: z.string(),}).partial().required({
    org_name: true,
    org_email: true,
    org_password: true,
    org_confirmPassword: true,
  }).refine((data) => data.org_password === data.org_confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
})

export type TorgSignupSchema = z.infer<typeof orgSignupSchema>;
