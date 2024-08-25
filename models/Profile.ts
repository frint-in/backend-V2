import mongoose, { Document, Schema } from 'mongoose';

const educationSchema = new Schema({
    degree_name: { type: String},
    institute_name: { type: String },
    board: { type: String},
    percentage: { type: String },
    media_field: { type: String}, // Assume it's a URL, add validation if necessary
    description: { type: String},
    field_of_study: { type: String},
    start_date: { type: String}, // Store dates as strings or use Date type
    end_date: { type: String} // Store dates as strings or use Date type
  });

export  interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
    languages?: string[];
    skills?: string[];
    achievements?: string[];
    experience?: string[];
    description?: string;
    dob?: string;
    gender?: string;
    education_details?: {
      degree_name?: string;
      institute_name?: string;
      board?: string;
      percentage?: string;
      media_field?: string; // Assume it's a URL, add validation if necessary
      description?: string;
      field_of_study?: string;
      start_date?: string;
      end_date?: string;
    }[];
    avatar?: string;
    resume?: string;
  }

// Define the Profile schema
const profileSchema = new Schema<IProfile>({
  languages: { type: [String]  },
  skills: { type: [String]  },
  achievements: { type: [String]  },
  experience: { type: [String] },
  description: { type: String},
  dob: { type: String},
  gender: { type: String},
  education_details: [educationSchema], // Embed the education schema
  avatar: { type: String},
  resume: { type: String},
});

const Profile = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
