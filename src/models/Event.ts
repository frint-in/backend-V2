import mongoose, { Document, Schema } from 'mongoose';

// Define the TypeScript interface for the Event document
interface IEvent extends Document {
  event_name?: string;
  event_type?: string;
  event_description?: string;
  org_id?: mongoose.Types.ObjectId; // Reference to Organisation model
  event_venue?: string;
  event_start?: string; // Can be Date or string depending on the format
  event_end?: string; // Can be Date or string depending on the format
  subevent_list?: mongoose.Types.ObjectId; // This can be an array or a single ObjectId depending on the requirement
  maintainer_id?: mongoose.Types.ObjectId; // Reference to User model
  event_poster?: string;
  event_sponsered?: string;
}

// Define the Event schema
const eventSchema = new Schema<IEvent>({
  event_name: { type: String },
  event_type: { type: String },
  event_description: { type: String },
  org_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' }, // Reference to the Organisation model
  event_venue: { type: String },
  event_start: { type: String }, // Consider changing to Date if working with date formats
  event_end: { type: String }, // Consider changing to Date if working with date formats
  subevent_list: { type: mongoose.Schema.Types.ObjectId, ref: 'Subevent' }, // Assuming 'Subevent' is a model. Update accordingly.
  maintainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
  event_poster: { type: String }, // Optional field
  event_sponsered: { type: String } // Optional field
});

// Create the Event model
const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
