import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';
import { formatArrZodErrors, formatGenZodErrors } from '@/utils/validator';
import User from '../../models/User';

import dotenv from 'dotenv';
import { google } from 'googleapis';
import mongoose from 'mongoose';
import { sendEmail } from '@/lib/helpers/mailer';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

export const signupUser = async (req: Request, res: Response) => {
      /*
   /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/SignUpUser"
                    }  
                }
            }
        } 
    */

  try {
    // Step 1: Validate input using Zod schema
    const parsedInput = signUpSchema.safeParse(req.body);
    if (!parsedInput.success) {
      console.error('Validation Error:', parsedInput.error.message);

      const errorMessages = formatGenZodErrors(parsedInput.error);
      return res.status(403).json({ msg: errorMessages });
    }

    console.log(parsedInput.data);
    

    const { phno, password, email } = parsedInput.data; // Extract data from parsed input

    // Step 2: Check if the user already exists based on phone number
    const existingUser = await User.findOne({ phno });
    if (existingUser) {
      console.log('existingUser', existingUser);
      return res.status(409).json({ message: 'User already exists' });
    }

    // Step 3: Hash the user's password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password.toString(), salt);

    // Step 4: Create a new user with hashed password
    const newUser = new User({ ...parsedInput.data, password: hashedPassword });

    const savedUser = await newUser.save();
    console.log('savedUser', savedUser);

    // Step 5: Send verification email
    const mailResponse = await sendEmail({ email: email, emailType: "VERIFY", userId: savedUser._id.toString() });
    console.log('mailresponse', mailResponse);
    if (mailResponse) {
      res.status(200).json({ message: 'Verification mail sent, please check your inbox' });
    } else {
      res.status(500).json({ message: 'An error occurred during email verification' });
    }

    // Optional: Step 6: Send OTP via SMS (Currently commented out)
    // const otpResponse = await sendOtp({ phno, name: savedUser.uname });
    // if (otpResponse) {
    //   res.status(200).json({ message: "OTP sent to your mobile number, please check your inbox" });
    // } else {
    //   res.status(500).json({ message: "An error occurred during OTP verification" });
    // }

  } catch (err) {
    // Type narrowing to handle the 'unknown' type error
    if (err instanceof Error) {
      console.error('Signup Error:', err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error('Unexpected error:', err);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const verifyUserEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("req body>>>>>>>>>", req.body);
    const { token } = req.body;

    console.log("token>>>>>", token);

    // Ensure token is a string
    if (typeof token !== 'string') {
      res.status(400).json({ message: "Invalid token format" });
      return;
    }

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    }).exec();

    if (!user) {
      res.status(400).json({ message: "Invalid Token" });
      return;
    }

    console.log("user>>>>", user);

    user.isVerified = true; // Correct typo in property name
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (err) {
    console.error("error in verifyUserEmail>>>>", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const signinUser = async (req: Request, res: Response) => {
  try {
    // Validate input using Zod schema
    const parsedInput = signInSchema.safeParse(req.body);
    if (!parsedInput.success) {
      // console.error('Validation Error:', parsedInput.error);
      const errorMessages = formatArrZodErrors(parsedInput.error);
      console.log(errorMessages);

      return res.status(400).json({ message: errorMessages});
    }

    const { email, password } = parsedInput.data;

    const user = await User.findOne({ email }).select("+password").exec();

    if (!user) {
      return res.status(400).json({ message: ['User not found'] });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: ['Please verify your account'] });
    }

    if (!user.password) {
      return res.status(500).json({ message: ['Server error: No password found'] });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
      return res.status(409).json({ message: ['Incorrect password'] });
    } else {
      const { password, ...others } = user.toObject(); // Convert user document to plain object
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h', // Adjust token expiration as needed
      });

      console.log('token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', token);

      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json({ others, token });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Signin Error:', err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error('Unexpected error:', err);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};



