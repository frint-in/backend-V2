import mongoose, { Document, Schema } from "mongoose";

interface IJob extends Document {
  job_name?: string;
  org_details?: mongoose.Types.ObjectId; // Reference to Company model
  org_name?: string;
  job_description?: string;
  job_categories?: string[];
  maintainer_phono?: number;
  job_poster?: string;
  application_list?: mongoose.Types.ObjectId[]; // References to Application model
  job_deadline?: string;
  job_duration?: string;
  job_type?: 'full-time' | 'part-time' | 'internship'; // Example literals
  job_position?: string;
  job_mode?: 'remote' | 'on-site' | 'hybrid'; // Example literals
  job_location?: string;
  job_stipend?: string;
  job_experience?: string;
  job_skills?: string[];
  maintainer_list?: mongoose.Types.ObjectId[]; // References to User model
  org_website?: string;
  org_logo?: string;
  org_social_media?: { platform?: string; link?: string }[];
  org_email?: string;
}

// Define the Job schema
const jobSchema = new Schema<IJob>({
  job_name: { type: String},
  org_details: { type: Schema.Types.ObjectId, ref: "Company"}, // Reference to Company model
  org_name: { type: String},
  job_description: { type: String},
  job_categories: { type: [String]},
  maintainer_phono: { type: Number},
  job_poster: { type: String},
  application_list: [{ type: Schema.Types.ObjectId, ref: "Application" }], // Reference to Application model
  job_deadline: { type: String},
  job_duration: { type: String},
  job_type: {
    type: String,
    enum: ["full-time", "part-time", "internship"], // Example job types
    required: true,
  },
  job_position: { type: String},
  job_mode: {
    type: String,
    enum: ["remote", "on-site", "hybrid"], // Example job modes
    required: true,
  },
  job_location: { type: String},
  job_stipend: { type: String},
  job_experience: { type: String},
  job_skills: { type: [String]},
  maintainer_list: [{ type: Schema.Types.ObjectId, ref: "User" }], // References to User model
  org_website: { type: String},
  org_logo: { type: String},
  org_social_media: [
    {
      platform: { type: String},
      link: { type: String},
    },
  ],
  org_email: { type: String},
});

// Create and export the Job model
const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;
