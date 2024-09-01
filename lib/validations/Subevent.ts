import { z } from 'zod';

// Define the Zod schema for Subevent
export const subeventSchema = z.object({
  subevent_name: z.string().min(1, "Subevent name is required"), // Ensures the subevent_name is a non-empty string
  subevent_start: z.string().min(1, "Subevent start date is required"), // Keeps as string, but can be refined if using a date format
  subevent_end: z.string().min(1, "Subevent end date is required"), // Keeps as string, but can be refined if using a date format
  subevent_description: z.string().min(1, "description is required"), // Optional field, adjust based on the use case
  subevent_poster: z.string(),
}).strict();

// Define the TypeScript type using Zod inference
export type TSubevent = z.infer<typeof subeventSchema>;

export const subeventPartialSchema = subeventSchema.partial()


export const createSubeventSchema = subeventSchema.partial({subevent_poster: true});

export type TcreateSubeventSchema = z.infer<typeof createSubeventSchema>;
// export const createEventSchema = eventSchema.partial({event_poster: true, event_sponsered: true, subevent_list: true, org_details: true});
export type TsubeventPartialSchema = z.infer<typeof subeventPartialSchema>;
