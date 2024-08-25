import express, {Request, Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import User from '../models/User'
import mongoose from 'mongoose'

import { formatZodErrors } from '../utils/validation'; 
import { signUpSchema } from '../lib/validations/auth'


export const signupUser = async (req:Request, res: Response) => {
    let parsedInput = signUpSchema.safeParse(req.body)
    if (!parsedInput.success) {

      console.error('parsedInput.error:', parsedInput.error.message );

      const errorMessages = formatZodErrors(parsedInput.error);
      console.error('Validation Error:', errorMessages);
      
      return res.status(403).json({
        msg:errorMessages
      });
    }

    console.log(parsedInput);
    
    // const email = parsedInput.data.email
    // const password = parsedInput.data.password 
    
    // const user = await User.findOne({ email: parsedInput.data.email });

    // if (user) {
    //     return res.status(400).json({ message: "User already exists" });
    //   }


    // if (user) {
    //   res.status(403).json({ message: 'User already exists' });
    // } else {
    //   const newUser = new User({ username, password });
    //   await newUser.save();
    //   const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' });
    //   res.json({ message: 'User created successfully', token });
    // }
  }