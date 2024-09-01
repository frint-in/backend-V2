import { z } from 'zod';

const jobSchema = z.object({
  job_name: z.string(), // Required string
  org_details: z.string(), // Assuming this will be the ObjectId string
  org_name: z.string(),
  job_description: z.string(),
  job_categories: z.array(z.string()), // Array of strings
  maintainer_phono: z.number(), // Required number
  job_poster: z.string(), // Assuming URL or path as a string
  application_list: z.array(z.string()), // Array of ObjectId strings
  job_deadline: z.string(), // Should be a date string (ISO format or similar)
  job_duration: z.string(),
  job_type: z.enum(["full-time", "part-time", "internship"]), // Enum with required field
  job_position: z.string(),
  job_mode: z.enum(["remote", "on-site", "hybrid"]), // Enum with required field
  job_location: z.string(),
  job_stipend: z.string(),
  job_experience: z.string(),
  job_skills: z.array(z.string()), // Array of strings for skills
  org_website: z.string().url("Invalid URL format"), // Validating as a URL
  org_logo: z.string(),
  org_social_media: z.array(
    z.object({
      platform: z.string(),
      link: z.string().url("Invalid URL format"),
    })
  ), // Array of objects with platform and link
  org_email: z.string().email("Invalid email format"), // Validating as an email
}).strict();

export const createJobSchema = jobSchema.partial().omit({org_name: true, org_details: true, org_email: true, org_logo: true, org_social_media: true, org_website: true, application_list: true, maintainer_phono: true
})

export const jobPartialSchema = jobSchema.partial()

export type TjobPartialSchema = z.infer<typeof jobPartialSchema>;
export type TcreateJobSchema = z.infer<typeof createJobSchema>;
