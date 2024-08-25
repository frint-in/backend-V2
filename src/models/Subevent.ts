import mongoose, { Document, Schema } from 'mongoose';

// Define the TypeScript interface for the Subevent document
interface ISubevent extends Document {
  subevent_name?: string;
  subevent_start?: string; // Can be Date or string depending on the format
  subevent_end?: string; // Can be Date or string depending on the format
  subevent?: string; // Assuming this is a description or additional details
}

// Define the Subevent schema
const subeventSchema = new Schema<ISubevent>({
  subevent_name: { type: String },
  subevent_start: { type: String }, // Consider changing to Date if working with date formats
  subevent_end: { type: String }, // Consider changing to Date if working with date formats
  subevent: { type: String } // Assuming this is a description or additional details
});
// Create the Subevent model
const Subevent = mongoose.model<ISubevent>('Subevent', subeventSchema);

export default Subevent;
