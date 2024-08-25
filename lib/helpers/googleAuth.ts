import { google } from 'googleapis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';
import Profile, { IProfile } from '@/models/Profile'; // Import the Profile model

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

const handleGoogleAuth = async (code: string, redirectUri: string) => {
  const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
  const { id_token, refresh_token } = tokens;

  // Verify the ID token and get user info
  const ticket = await oauth2Client.verifyIdToken({
    idToken: id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Google authentication failed: no user info in token.');
  }

  const email = payload.email;

  // Check if the user exists in the database
  let user = await User.findOne({ email }).lean<IUser>();

  if (!user) {
    // Create a new profile for the user
    const profile = new Profile({
      avatar: payload.picture,
      // Populate other profile details as needed
    });

    await profile.save();

    // Create a new user and associate with the profile
    user = new User({
      email,
      uname: payload.name,
      isGoogleUser: true, // Flag to indicate Google sign-up
      refreshToken: refresh_token,
      isVerified: true,
      profile_details: profile._id, // Link the profile
    });

    await user.save();
  } 

  // Generate a JWT token for the user
  const token = jwt.sign({ id: user._id }, process.env.JWT as string, {
    expiresIn: '1h', // Adjust expiration time as needed
  });

  return { user, token };
};

export default handleGoogleAuth;
