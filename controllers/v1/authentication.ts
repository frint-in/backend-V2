import { Request, Response } from 'express';
import dotenv from 'dotenv'
import { google} from 'googleapis'
import handleGoogleAuth from '@/lib/helpers/googleAuth';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { Types } from 'mongoose';
import Organisation from '@/models/Organisation';



dotenv.config()


const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.DOMAIN
  )
  

export const signinGoogle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri: string | undefined;
    if (origin === 'http://localhost:5173') {
      console.log('process.env.GOOGLE_REDIRECT_URI_LOCAL_5173', process.env.GOOGLE_REDIRECT_URI_LOCAL_5173);
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === 'http://localhost:5174') {
      console.log('process.env.GOOGLE_REDIRECT_URI_LOCAL_5174>>>>>>', process.env.GOOGLE_REDIRECT_URI_LOCAL_5174);
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD; // Default to production
    }

    if (!redirectUri) {
      throw new Error('No valid redirect URI found');
    }

    const { user, token } = await handleGoogleAuth(code, redirectUri);

    res.cookie('access_token', token, { httpOnly: true });
    res.status(200).json({ message: 'Sign in successful', user, token });
  } catch (err) {
    console.error('Error during Google sign-in:', err);
    res.status(500).json({ message: 'Error while handling Google authentication' });
  }
};



export const linkGoogleAccount = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;
    let redirectUri: string;
    if (origin === 'http://localhost:5173') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173!;
    } else if (origin === 'http://localhost:5174') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174!;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD!;
    }

    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
    const { id_token, refresh_token } = tokens;

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const picture = payload?.picture;

    // Find the existing user by their ID
    let user = await User.findById(req.user.id).select("+refreshToken").exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a profile; if not, create one
    let profile;
    if (user.profile_details) {
      profile = await Profile.findById(user.profile_details).exec();
    } else {
      profile = new Profile();
      user.profile_details = profile._id ; 
    }

    // Update the user's profile with Google account details
    if (profile) {
      if (!profile.avatar && picture) {
        profile.avatar = picture;
      }
      await profile.save();
    }

    // Update the user with Google account details
    user.isGoogleUser = true; // Flag to indicate Google sign-up
    if (typeof refresh_token === 'string') { // Ensure refresh_token is a string
      user.refreshToken = refresh_token;
    }

    await user.save();

    res.status(200).json({ message: 'Google account linked successfully', user });
  } catch (err) {
    console.error('Error during Google account linking:', err);
    res.status(500).json({ message: 'Error while handling Google account linking' });
  }
};



export const linkGoogleAccountOrganisation = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri: string;
    if (origin === 'http://localhost:5173') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173!;
    } else if (origin === 'http://localhost:5174') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174!;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD_COMPANY!;
    }

    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
    const { id_token, refresh_token } = tokens;

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Find the existing organisation by their ID
    let organisation = await Organisation.findById(req.organization.id); // Ensure 'organisationId' is in the request body

    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    organisation.org_isGoogleUser = true; // Flag to indicate Google sign-up
    if (!refresh_token) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    organisation.org_refreshToken = refresh_token ; // Save refresh token securely

    await organisation.save();

    res.status(200).json({ message: 'Google account of organisation linked successfully', organisation });
  } catch (err) {
    console.error('Error during Google account linking:', err);
    res.status(500).json({ message: 'Error while handling Google account linking' });
  }
};





export const verifyEmail = async (req: Request, res: Response) => {
  try {
    console.log("req body>>>>>>>>>", req.body);
    const { token, type } = req.body; // Include type to differentiate between User and Organisation

    console.log("token>>>>>", token);

    // Determine the model based on the type provided



    let entity
    switch (type) {
      case 'user':
        entity = await User.findOne({
          verifyToken: token,
          verifyTokenExpiry: { $gt: Date.now() },
        });
    
        break;
      case 'organisation':
        entity = await Organisation.findOne({
          verifyToken: token,
          verifyTokenExpiry: { $gt: Date.now() },
        });
       break;
      default:
        break;
    }

    if (!entity) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("entity>>>>", entity);

    entity.isVerified = true;
    entity.verifyToken = undefined;
    entity.verifyTokenExpiry = undefined;
    await entity.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (err) {
    console.error("error in verifyUserEmail>>>>", err);
    res.status(500).json({ message: "Server error" });
  }
};
