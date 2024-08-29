import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signInSchema, signUpSchema } from "@/lib/validations/schema";
import { formatArrZodErrors, formatGenZodErrors } from "@/utils/validator";
import User, { IUser } from "../../models/User";
import dotenv from "dotenv";
import { sendEmail } from "@/lib/helpers/mailer";
import Profile, { IProfile } from "@/models/Profile";
import {
  handleFileUpload,
  isMulterFileArrayDictionary,
  MulterRequest,
} from "@/utils/upload";
import {
  organisationPartialSchema,
  organizationSchema,
  orgSignupSchema,
  TorganisationPartialSchema,
  TorgSignupSchema,
} from "@/lib/validations/Organisation";
import { parseFormData } from "@/utils/parser";
import Organisation, { IOrganisation } from "@/models/Organisation";

dotenv.config();

export const signupOrganisation = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = orgSignupSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      console.log();
      
      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);

    const {org_email} = parsedInput.data

        // Step 2: Check if the user already exists based on phone number
        const existingOrg = await Organisation.findOne({ org_email });
        if (existingOrg) {
          console.log('existingOrg', existingOrg);
          return res.status(409).json({ message: 'Organization already exists' });
        }

    const updates: TorgSignupSchema = { ...parsedInput.data };

    // Handle file upload
    if (isMulterFileArrayDictionary(req.files)) {
      const org_logo: Express.Multer.File | undefined = req.files["org_logo"]
        ? req.files["org_logo"][0]
        : undefined;

      const orgLogoUrl = await handleFileUpload({
        type: "org_logo",
        file: org_logo,
      });


      if (orgLogoUrl) {
        
        updates.org_logo = orgLogoUrl;
      }else{
        console.log('no file uploaded');
      // return res.status(500).json({ message: "Image Upload failed. Please try again" });
      }

      
    } else {
      console.log("No files uploaded");
    }

    // Destructure to remove org_confirmPassword and org_password
    const { org_confirmPassword, org_password, ...orgData  } = updates; // Use 'updates' instead of 'parsedInput.data'

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(org_password.toString(), salt);

    console.log("updates", updates);

    // Create new organization with orgData and add hashed password
    const newOrg = new Organisation({
      ...orgData,
      org_password: hashedPassword,
    });

    const savedOrg = await newOrg.save();

    console.log('savedOrg', savedOrg);

    //Update the user's organisation_list
    const userId= req.user.id;

    console.log('userId',userId);
    
    const user = await User.findById(userId);

    console.log('user>>>>>>>>>', user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.organisation_list = user.organisation_list || [];
    user.organisation_list.push({ org_id: savedOrg._id, role: 'owner' }); // Assuming 'Admin' role for the creator

    const updatedUser = await user.save();

    console.log('updatedUser>>>>>>>>>>', updatedUser);
    

        // Step 5: Send verification email
        // const mailResponse = await sendEmail({ 
        //   email: org_email, 
        //   emailType: "VERIFY", 
        //   entityId: savedOrg._id.toString(),
        //   entityType: "ORGANISATION"
        // });
        // console.log('mailresponse', mailResponse);
    res.status(200).json({
        message: ["Organisation created successfully"],
        organisation: savedOrg,
      });
  } catch (err) {
    // Type narrowing to handle the 'unknown' type error
    if (err instanceof Error) {
      console.error("Signup Error:", err);
      console.error("Signup Error:", err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};



export const updateOrganisation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const orgId = req.params.id;

    console.log('orgId', orgId);
    

    const user = await User.findOne({_id:userId, 'organisation_list.org_id': orgId}).populate('organisation_list')
    // If the user is not found or the organization is not in the list
    if (!user) {
      return res.status(409).json({ message: 'Unauthorized. Ask owner to provide access' });
    }

    console.log(req.body);
    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = organisationPartialSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);

    const updates: TorganisationPartialSchema = { ...parsedInput.data };

    // Handle file upload
    if (isMulterFileArrayDictionary(req.files)) {
      const org_logo: Express.Multer.File | undefined = req.files["org_logo"]
        ? req.files["org_logo"][0]
        : undefined;

      const orgLogoUrl = await handleFileUpload({
        type: "org_logo",
        file: org_logo,
      });

      if (orgLogoUrl) {
        updates.org_logo = orgLogoUrl;
      }else{
        console.log('no files uploaded');
      }
    } else {
      console.log("No files uploaded");
    }

    console.log("updates", updates);

    //update the organisation
    const updatedOrg = await Organisation.findByIdAndUpdate(orgId, updates, { new: true });
    res.status(200).json({
      message: 'Organization updated successfully',
      organisation: updatedOrg,
    });
  } catch (err) {
    // Type narrowing to handle the 'unknown' type error
    if (err instanceof Error) {
      console.error("Signup Error:", err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};


