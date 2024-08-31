import mongoose, { Document, Schema } from 'mongoose';


export interface IOrganisation extends Document {
  _id: mongoose.Types.ObjectId;
  org_password?: string; 
  org_name?: string;
  org_email?: string;
  org_description?: string;
  org_website?: string;
  org_categories?: string[];
  org_location?: string;
  org_phono?: number;
  org_type?: 'non-profit' | 'for-profit' | 'government' | 'educational'; // Example literals
  org_logo?: string;
  org_isGoogleUser?: boolean;
  org_refreshToken?: string;
  org_establish?: number;
  org_social_media?: { platform?: string; link?: string }[];
  isVerified?: boolean;
  verifyToken: string;
  isOnboard?: boolean;
  verifyTokenExpiry: Date;
  maintainer_list: string[]
}

// Define the Organisation schema
const organisationSchema = new Schema<IOrganisation>({
  org_password: {type: String,  select: false },
  org_name: { type: String },
  org_email: { type: String },
  org_description: { type: String },
  org_website: { type: String },
  org_categories: { type: [String] },
  org_location: { type: String },
  org_phono: { type: Number },
  org_type: {
    type: String,
    enum: ['non-profit', 'for-profit', 'government', 'educational'], // Example organization types
    required: true
  },
  org_logo: { type: String },
  org_isGoogleUser: { type: Boolean },
  org_refreshToken: { type: String, select: false },
  org_establish: { type: Number },
  org_social_media: [
    {
      platform: { type: String },
      link: { type: String }
    }
  ],
  isVerified: { type: Boolean, default: false },
  isOnboard: { type: Boolean, default: false },
  verifyToken: { type: String }, // Add token field
  verifyTokenExpiry: { type: Date }, // Add token expiry field
  maintainer_list: {type: [String]}
});

// Create and export the Organisation model
const Organisation = mongoose.model<IOrganisation>('Organisation', organisationSchema);

export default Organisation;
