import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Define the Zod schema for event creation
export const eventSchema = z.object({
  event_name: z.string(),
  event_type: z.string(),
  event_description: z.string(),
  org_details: z.instanceof(ObjectId), 
  event_venue: z.string(),
  event_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Event start date must be a valid date string.",
  }), // Validates as a date string
  event_end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Event end date must be a valid date string.",
  }), // Validates as a date string
  subevent_list: z.array(z.string()), // Assuming subevent_list is an array of ObjectIds
  event_poster: z.string(),
  event_sponsered: z.string(),
}).strict();

//DOUBT: know which fields are supposed to be partial
export const createEventSchema = eventSchema.partial({event_poster: true, event_sponsered: true, subevent_list: true, org_details: true});

export const eventPartialSchema = eventSchema.partial();

export type TeventPartialSchema = z.infer<typeof eventPartialSchema>;

export type TcreateEventSchema = z.infer<typeof createEventSchema>;



