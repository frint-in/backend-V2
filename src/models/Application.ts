import mongoose, { Document, Schema } from 'mongoose';


interface IApplication extends Document {
  user_id: mongoose.Types.ObjectId;
  answers_list?: string;
  resume?: string;
  job_id: mongoose.Types.ObjectId;
  status?: 'pending' | 'accepted' | 'rejected';
}


const applicationSchema = new Schema<IApplication>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  answers_list: { type: String},
  resume: { type: String, required: true },
  job_id: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"], // Allowed values for the status field
    required: true,
    default: "pending", // Default value if not provided
  },
});

// Create and export the Application model
const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
