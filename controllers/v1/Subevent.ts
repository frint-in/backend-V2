import { Request, response, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signInSchema, signUpSchema } from "@/lib/validations/schema";
import { formatArrZodErrors, formatGenZodErrors } from "@/utils/validator";
import User, { IUser } from "../../models/User";
import dotenv from "dotenv";

import {
  handleFileDelete,
  handleFileUpload,
  isMulterFileArrayDictionary,
  MulterRequest,
} from "@/utils/upload";

import { parseFormData } from "@/utils/parser";
import Organisation from "@/models/Organisation";
import mongoose from "mongoose";
import { createSubeventSchema, subeventPartialSchema, subeventSchema, TcreateSubeventSchema, TsubeventPartialSchema } from "@/lib/validations/Subevent";
import { isUserMaintainer } from "@/utils/helpers";
import Subevent from "@/models/Subevent";
import Event from "@/models/Event";

dotenv.config();

export const createSubevent = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated by middleware

    const { orgId, eventId } = req.params;
    // Check if orgId is provided
    if (!orgId) {
      return res.status(400).json({ message: ["Organisation ID is required"] });
    }

    console.log(req.body);
    console.log(req.file);
    console.log("req.files",req.files);

    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = createSubeventSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);

    const { subevent_name } = parsedInput.data;

    //check if the user is maintainer
    await isUserMaintainer(req, res, {
      orgId,
      userId,
      errorMessage: "You are not authorized to create an event",
    });

    //check if event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: ["Event not found"] });
    }

    //   Check if the subevent exists on name
    const existingSubevent = await Subevent.findOne({ subevent_name });
    if (existingSubevent) {
      console.log("existingSubevent", existingSubevent);
      return res.status(409).json({ message: ["Subevent already exists"] });
    }


    const updates: TcreateSubeventSchema = { ...parsedInput.data };


        // Handle file upload
        if (isMulterFileArrayDictionary(req.files)) {
          const subevent_poster: Express.Multer.File | undefined = req.files["subevent_poster"]
            ? req.files["subevent_poster"][0]
            : undefined;
    
          const subeventPosterUrl = await handleFileUpload({
            type: "subevent_poster",
            file: subevent_poster,
          });
    
    
          if (subeventPosterUrl) {
            
            updates.subevent_poster = subeventPosterUrl;
          }else{
            console.log('no file uploaded');
          return res.status(500).json({ message: "Image Upload failed. Please try again" });
          }
    
          
        } 

    const newSubevent = new Subevent({ ...updates });

    const savedSubevent = await newSubevent.save();

    console.log("savedSubevent>>>", savedSubevent);

    event.subevent_list = event.subevent_list || [];
    //adding the subevent to the subevent_list of the specified event
    event.subevent_list.push(newSubevent.id);

    const updatedEvent = await event.save();

    console.log("updated event>>>>>>>>", updatedEvent);

    res
      .status(200)
      .json({
        message: ["subevent created successfully"],
        subevent: savedSubevent,
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






export const updateSubevent = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated by middleware

    const { subeventId, orgId } = req.params;
    // Check if orgId is provided
    if (!subeventId) {
      return res.status(400).json({ message: ["subevent ID is required"] });
    }

    console.log(req.body);
    console.log('req.files',req.files);
    
    const parsedBody = parseFormData(req.body);
    console.log("parsedBody", parsedBody);

    // Validate input using Zod schema
    const parsedInput = subeventPartialSchema.safeParse(parsedBody);
    if (!parsedInput.success) {
      console.error("Validation Error:", parsedInput.error.message);

      const errorMessages = formatArrZodErrors(parsedInput.error);
      return res.status(403).json({ message: errorMessages });
    }

    console.log(parsedInput.data);

    //check if the user is maintainer
    await isUserMaintainer(req, res, {
      orgId,
      userId,
      errorMessage: "You are not authorized to update the event",
    });

    //   Check if the subevent exists on name
    const subevent = await Subevent.findById(subeventId);

    if (!subevent) {
      return res.status(404).json({message: ["subevent not found"]})
    }



    const updates: TsubeventPartialSchema = { ...parsedInput.data };


        // Handle file upload
        if (isMulterFileArrayDictionary(req.files)) {
          const subevent_poster: Express.Multer.File | undefined = req.files["subevent_poster"]
            ? req.files["subevent_poster"][0]
            : undefined;
    
          const subeventPosterUrl = await handleFileUpload({
            type: "subevent_poster",
            file: subevent_poster,
            oldFileUrl: subevent.subevent_poster
          });
    
    
          if (subeventPosterUrl) {
            
            updates.subevent_poster = subeventPosterUrl;
          }else{
            console.log('no file uploaded');
          }
    
          
        } 

    // const updateSubevent = new Subevent({ ...updates });

    const updateSubevent = await Subevent.findByIdAndUpdate(subeventId, {...updates}, {new: true}).exec()


    console.log("savedSubevent>>>", updateSubevent);

    res
      .status(200)
      .json({
        message: ["subevent updated successfully"],
        subevent: updateSubevent,
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


export const deleteSubevent = async (req: Request, res: Response) => {
  try {

    const userId = req.user.id

   const {orgId, eventId, subeventId} = req.params


    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: ['Event not found'] });
    }
    const subevent = await Subevent.findById(subeventId)


    if (!subevent) {
      return res.status(404).json({ message: ['subevent not found'] });
    }

    //check if the user is maintainer
    await isUserMaintainer(req, res, {
      orgId,
      userId,
      errorMessage: "You are not authorized to delete the event",
    });

    // Remove subeventId from event's subevent_list
    event.subevent_list = event.subevent_list.filter(
      (id) => id !== subeventId
    );
      // Save the updated event
      await event.save();


    await handleFileDelete({oldFileUrl: subevent.subevent_poster})
    
    await subevent.deleteOne()

    return res.status(200).json({ message: ['Subevent Deleted Successfully'] });


} catch (error) {
  console.error('Error deleting event:', error);
  return res.status(500).json({ message: ['Internal server error'] });
}
}