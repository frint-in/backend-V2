import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signupUser } from "../controllers/auth";

const router = express.Router();

router.post("/sign-up",signupUser);

export default router;
