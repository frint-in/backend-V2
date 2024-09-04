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
  handleFileDelete,
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
import Job from "@/models/Job";
import mongoose from "mongoose";
import { createJobSchema, jobPartialSchema, TcreateJobSchema, TjobPartialSchema } from "@/lib/validations/Job";
import { isUserMaintainer } from "@/utils/helpers";
import { applicationSchemaMain, applicationStatusSchema, TapplicationSchemaMain, TapplicationStatusSchema } from "@/lib/validations/Application";
import Application from "@/models/Application";

dotenv.config();




export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: ["User not found"] });
      }

      const { applicationId, jobId } = req.params;
  
    // Validate input using Zod schema
      const parsedBody = parseFormData(req.body);
      const parsedInput = applicationStatusSchema.safeParse(parsedBody);
      if (!parsedInput.success) {
        const errorMessages = formatArrZodErrors(parsedInput.error);
        return res.status(403).json({ message: errorMessages });
      }
  
  
      const updates: TapplicationStatusSchema = { ...parsedInput.data };
  
  
        // Find the application by ID
        // const application = await Application.findById(applicationId);
        // if (!application) {
        //   return res.status(404).json({ message: ["Application not found"] });
        // }

        const application = await Application.find({user_id: { $eq: userId }, job_id: {$eq: jobId}})
        if (!application) {
        return res.status(404).json({ message: ["Application not found"] });
        }


                // Handle file upload
      if (isMulterFileArrayDictionary(req.files)) {
        const resume: Express.Multer.File | undefined = req.files["resume"]
          ? req.files["resume"][0]
          : undefined;
  
        if (resume) {
          const resumeUrl = await handleFileUpload({
            type: "resume",
            file: resume,
          });
  
          if (resumeUrl) {
            updates.resume = resumeUrl;
          } else {
            console.log('No file uploaded');
          }
        }
      } else {
        console.log("No files uploaded");
      }
  
      updates.status = parsedInput.data.status
  
      updates.answers_list = parsedInput.data.answers_list
  
      
      await Application.findByIdAndUpdate(applicationId, updates, { new: true });
      res.status(200).json({
        message: ['Application updated successfully'],
      });
      
    } catch (error) {
      console.error("Error applying to job:", error);
      return res.status(500).json({ message: ["Internal server error"] });
  }
  };