import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signinUser, signupUser, verifyUserEmail } from "@/controllers/v1/User";



const router = express.Router();

//create
router.post("/signup",signupUser);

router.post("/signin",signinUser);

//read

//update

//delete

//verifyEmail
router.post("/verifyemail", verifyUserEmail);

export default router;
