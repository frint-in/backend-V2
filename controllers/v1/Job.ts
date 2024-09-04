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






export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated by middleware
    const {orgId} = req.params

    console.log('orgId', orgId);

    // Check if orgId is provided
    if (!orgId) {
      return res.status(400).json({ message: ['Organisation ID is required'] });
    }


    console.log(req.body);
    console.log(req.files);
    
    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = createJobSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      console.log();
      
      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);

    const {job_name} = parsedInput.data


    const org = await Organisation.findById(orgId);

        // If organization is not found, throw an error
        if (!org) {
            return res.status(404).json({ message: ['Organisation not found'] });
          }

        // Check if the userId is present in the maintainer's list
        const isMaintainer = org.maintainer_list.some(maintainerId => maintainerId === userId)

        if (!isMaintainer) {
        return res.status(403).json({ message: ['you are not authorized to create a job'] });
      }
      //Check if the job already exists based on name
      const existingJob = await Job.findOne({ job_name });
      if (existingJob) {
        console.log('existingOrg', existingJob);
        return res.status(409).json({ message: ['Job already exists'] });
      }


    const updates: TcreateJobSchema = { ...parsedInput.data };


    // Handle file upload
    if (isMulterFileArrayDictionary(req.files)) {
      const job_poster: Express.Multer.File | undefined = req.files["job_poster"]
        ? req.files["job_poster"][0]
        : undefined;

      const jobPosterUrl = await handleFileUpload({
        type: "job_poster",
        file: job_poster,
      });


      if (jobPosterUrl) {
        
        updates.job_poster = jobPosterUrl;
      }else{
        console.log('no file uploaded');
      return res.status(500).json({ message: ["Image Upload failed. Please try again"] });
      }

      
    } else {
      console.log("No files uploaded");
    }

    const {org_email, org_name, org_social_media, org_website, org_logo} = org

    // Create the new job
    const newJob = new Job({
      ...updates,
      org_details: new mongoose.Types.ObjectId(orgId),
      org_email, org_name, org_logo, org_social_media, org_website
    });

    // Save the new job to the database
    const savedJob = await newJob.save();

    // Respond with the created job
    return res.status(201).json({message: ['Job created successfully'], job: savedJob});
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: ['Internal server error'] });
  }
};



export const updateJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated by middleware
    const { jobId } = req.params; // Assuming the job ID is passed as a URL parameter
    const { orgId } = req.params; // Assuming the org ID is passed as a URL parameter

    console.log("orgId>>>>>>>", orgId);
    
    // Check if orgId and jobId are provided
    if (!orgId) {
      return res.status(400).json({ error: 'Organisation ID is required' });
    }
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Validate input using Zod schema
    const parsedBody = parseFormData(req.body);
    const parsedInput = jobPartialSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    // Get the organization
    const org = await Organisation.findById(orgId);

    console.log("org>>>>>>>>", org);
    
    if (!org) {
      return res.status(404).json({ message: ['Organisation not found'] });
    }

    // Check if the user is a maintainer
    const isMaintainer = org.maintainer_list.some((maintainerId) => maintainerId.toString() === userId);
    if (!isMaintainer) {
      return res.status(403).json({ error: 'You are not authorized to update this job' });
    }


    const updates: TjobPartialSchema = { ...parsedInput.data };

    const job = await Job.findById(jobId)

    if (!job) {
        return res.status(404).json({ message: ['Job not found'] });
    }

    // Handle file upload
    if (isMulterFileArrayDictionary(req.files)) {
      const job_poster: Express.Multer.File | undefined = req.files["job_poster"]
        ? req.files["job_poster"][0]
        : undefined;

      if (job_poster) {
        const jobPosterUrl = await handleFileUpload({
          type: "job_poster",
          file: job_poster,
          oldFileUrl: job.job_poster
        });

        if (jobPosterUrl) {
          updates.job_poster = jobPosterUrl;
        } else {
          console.log('No file uploaded');
        }
      }
    } else {
      console.log("No files uploaded");
    }

    // Update the job with new details
    const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });
    res.status(200).json({
      message: ['Job updated successfully'],
      job: updatedJob,
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ message: ['Internal server error'] });
  }
};




export const deleteJob = async (req: Request, res: Response) => {
  try {

    const userId = req.user.id

   const {orgId, jobId} = req.params

    const job = await Job.findById(jobId)

    if (!job) {
      return res.status(404).json({ message: ['Job not found'] });
    }

    await isUserMaintainer(req, res, {orgId, userId, errorMessage: "You are unauthorized to delete the job"})


    await handleFileDelete({oldFileUrl: job.job_poster})
    
    await job.deleteOne()

    return res.status(200).json({ message: ['Job Deleted Successfully'] });


} catch (error) {
  console.error('Error deleting job:', error);
  return res.status(500).json({ message: ['Internal server error'] });
}
}


export const applyToJob = async (req: Request, res: Response) => {
  try {
      const { jobId } = req.params; // Extract the job ID from the request parameters
      
      const userId = req.user.id


    // Validate input using Zod schema
    const parsedBody = parseFormData(req.body);
    const parsedInput = applicationSchemaMain.safeParse(parsedBody);
    if (!parsedInput.success) {
      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }


    const updates: TapplicationSchemaMain = { ...parsedInput.data };

      
      const { resume, answers_list } = req.body; // Get the user ID, resume, and answers list from the request body

      // Find the job by ID
      const job = await Job.findById(jobId);
      if (!job) {
          return res.status(404).json({ message: ["Job not found"] });
      }

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: ["User not found"] });
      }

      // Check if the user has already applied for this job
      const existingApplication = await Application.findOne({ user_id: userId, job_id: jobId });
      if (existingApplication) {
          return res.status(409).json({ message: ["You have already applied for this job"] });
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

      // Create a new application
      const newApplication = new Application({
          user_id: new mongoose.Types.ObjectId(userId),
          job_id: new mongoose.Types.ObjectId(jobId),
          ...updates
      });

      // Save the application
      await newApplication.save();

      // Update the job's application_list
      job.application_list.push(newApplication.id);
      await job.save();

      // Update the user's application_list
      user.application_list.push(newApplication.id);
      await user.save();

      return res.status(201).json({ message: ["Application submitted successfully"], application: newApplication });
  } catch (error) {
      console.error("Error applying to job:", error);
      return res.status(500).json({ message: ["Internal server error"] });
  }
};

