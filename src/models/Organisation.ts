import mongoose, { Document, Schema } from 'mongoose';


interface IOrganisation extends Document {
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
  org_isVerified?: boolean;
}

// Define the Organisation schema
const organisationSchema = new Schema<IOrganisation>({
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
  org_refreshToken: { type: String },
  org_establish: { type: Number },
  org_social_media: [
    {
      platform: { type: String },
      link: { type: String }
    }
  ],
  org_isVerified: { type: Boolean }
});

// Create and export the Organisation model
const Organisation = mongoose.model<IOrganisation>('Organisation', organisationSchema);

export default Organisation;
