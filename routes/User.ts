import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signinUser, signupUser, verifyUserEmail } from "@/controllers/User";



const router = express.Router();

router.post("/signup",signupUser);

router.post("/signin",signinUser);

//verifyEmail
router.post("/verifyemail", verifyUserEmail);

export default router;
