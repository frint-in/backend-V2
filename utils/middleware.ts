import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
      };
      organization: {
        id:string
      }
    }
  }
}

//need to test verifyToken
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: 'Error in access_token' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ error: 'Error in verifying token' });
    }

    if (user) {
      req.user = user;

      console.log('user.id in verifyToken>>>>>>>', user.id);

      if (user.isGoogleUser) {
        oauth2Client.setCredentials({ refresh_token: user.refreshToken });

        // Automatically refresh the access token if necessary
        const tokens = await oauth2Client.getAccessToken();
        const newAccessToken = tokens.token;

        // Update the access token in the JWT cookie
        const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
          expiresIn: '1h'
        });

        res.cookie('access_token', newToken, { httpOnly: true });

        // Update credentials with the new access token
        oauth2Client.setCredentials({ access_token: newAccessToken });
      }
      next();
    }
  });
};

export const verifyOrganisationToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token_organisation; // Updated cookie name
  if (!token) {
    return res.status(401).json({ message: 'Error in access_token' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, organisation: any) => {
    if (err) {
      return res.status(401).json({ message: 'Error in verifying token' });
    }

    if (organisation) {
      req.organization = organisation;

      console.log('organisation.id in verifyOrganisationToken>>>>>>>', organisation.id);

      if (organisation.isGoogleUser) {
        oauth2Client.setCredentials({ refresh_token: organisation.refreshToken });

        // Automatically refresh the access token if necessary
        const tokens = await oauth2Client.getAccessToken();
        const newAccessToken = tokens.token;

        // Update the access token in the JWT cookie
        const newToken = jwt.sign({ id: organisation.id }, process.env.JWT_SECRET as string, {
          expiresIn: '1h'
        });

        res.cookie('access_token_organisation', newToken, { httpOnly: true });

        // Update credentials with the new access token
        oauth2Client.setCredentials({ access_token: newAccessToken });
      }
      next();
    }
  });
};
