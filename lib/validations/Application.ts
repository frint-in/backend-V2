import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Define the Zod schema for event creation
const applicationSchema = z.object({
    user_id: z.string().min(1, "User ID is required"), // Assuming ObjectId is stored as a string
    answers_list: z.string(), // Optional string field for answers
    resume: z.string(), // Resume as a non-empty string
    job_id: z.string().min(1, "Job ID is required"), // Assuming ObjectId is stored as a string
    status: z.enum(["pending", "shortlist", "rejected", "hired"]).default("pending"), // Status with default value
  }).strict();

//DOUBT: know which fields are supposed to be partial
export const applicationSchemaMain = applicationSchema.partial({resume: true, answers_list: true, status: true}).omit({job_id: true, user_id: true});

export const applicationStatusSchema = applicationSchema.partial({resume: true, answers_list: true}).omit({job_id: true, user_id: true}).required({status: true});


export type TapplicationSchemaMain = z.infer<typeof applicationSchemaMain>;
export type TapplicationStatusSchema = z.infer<typeof applicationStatusSchema>;



