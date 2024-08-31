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
import Event from "@/models/Event";
import mongoose from "mongoose";
import { createEventSchema, TcreateEventSchema } from "@/lib/validations/Event";

dotenv.config();






export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated by middleware
    const {  event_name, event_type, event_description, event_venue, event_start, event_end, event_poster } = req.body;
    const {orgId} = req.params

    console.log('orgId', orgId);

    // Check if orgId is provided
    if (!orgId) {
      return res.status(400).json({ error: 'Organisation ID is required' });
    }


    console.log(req.body);
    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = createEventSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      console.log();
      
      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);


    //get the org
    const org = await Organisation.findById(orgId)

    if (!org) {
      return res.status(404).json({ error: 'Organisation not found' });
    }


    // //check if the userId is present in the maintainer's list:
    // const isOwner = user.organisation_list?.some(org => org.org_id.toString() === orgId && org.role === 'owner');
    const isMaintainer = org.maintainer_list.some(maintainerId => maintainerId === userId)

      if (!isMaintainer) {
      return res.status(403).json({ error: 'You are not authorized to create an event for this organization' });
    }


      //Check if the event already exists based on name
      const existingEvent = await Event.findOne({ event_name });
      if (existingEvent) {
        console.log('existingOrg', existingEvent);
        return res.status(409).json({ message: 'Organization already exists' });
      }


    const updates: TcreateEventSchema = { ...parsedInput.data };


    // Handle file upload
    if (isMulterFileArrayDictionary(req.files)) {
      const event_poster: Express.Multer.File | undefined = req.files["event_poster"]
        ? req.files["event_poster"][0]
        : undefined;

      const eventPosterUrl = await handleFileUpload({
        type: "event_poster",
        file: event_poster,
      });


      if (eventPosterUrl) {
        
        updates.event_poster = eventPosterUrl;
      }else{
        console.log('no file uploaded');
      return res.status(500).json({ message: "Image Upload failed. Please try again" });
      }

      
    } else {
      console.log("No files uploaded");
    }


    // Create the new event
    const newEvent = new Event({
      ...updates,
      org_details: new mongoose.Types.ObjectId(orgId)
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();

    // Respond with the created event
    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};