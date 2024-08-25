import mongoose, { Document, Schema } from 'mongoose';

const organisationSchema = new Schema({
  org_id: { type: Schema.Types.ObjectId, ref: 'Organisation' },
  role: { type: String }
});

interface IUser extends Document {
  uname?: string;
  email?: string;
  password?: string; // +select
  phno?: number;
  specialisation?: string[];
  isGoogleUser?: boolean;
  isVerified?: boolean;
  isOnboard?: boolean;
  application_list?: mongoose.Types.ObjectId[];
  verifyToken?: boolean;
  verifyTokenExpiry?: Date;
  profile_details?: mongoose.Types.ObjectId;
  organisation_list?: {
    org_id?: mongoose.Types.ObjectId;
    role?: string;
  }[];
  refreshToken?: string; // +select
}


const userSchema = new Schema<IUser>({
  uname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password: { type: String },
  password: { type: String, select: false },
  phno: { type: Number},
  specialisation: { type: [String]},
  isGoogleUser: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isOnboard: { type: Boolean, default: false },
  application_list: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  verifyToken: { type: Boolean, default: false },
  verifyTokenExpiry: { type: Date},
  profile_details: { type: Schema.Types.ObjectId, ref: 'Profile'},
  organisation_list: [organisationSchema], // Embed the organisationSchema
  // refreshToken: {type: String}
  refreshToken: {type: String, select: false }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
