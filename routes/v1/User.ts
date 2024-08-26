import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signinUser, signupUser, updateUser, verifyUserEmail } from "@/controllers/v1/User";
import { verifyToken } from "@/utils/middleware";
import multer from "multer";

//multer config
const upload = multer({
    storage: multer.memoryStorage(),
  });
  
  

const router = express.Router();

router.post("/signup",signupUser);

router.post("/signin",signinUser);

//read

//update
router.put("/updateuser", verifyToken,upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]), updateUser);

//delete
// router.delete("/:id", verifyToken, deleteUser);

//verifyEmail
router.post("/verifyemail", verifyUserEmail);

export default router;
