import { signupOrganisation } from "@/controllers/v1/Organisation";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

router.post("/signup",upload.fields([
    { name: "org_logo", maxCount: 1 },
  ]), signupOrganisation);
// router.post("/signin",signinUser);

//read

//update
// router.put("/updateuser", verifyToken,upload.fields([
//     { name: "profileImg", maxCount: 1 },
//     { name: "resume", maxCount: 1 },
//   ]), updateUser);

//delete
// router.delete("/:id", verifyToken, deleteUser);

//verifyEmail
// router.post("/verifyemail", verifyUserEmail);

export default router;
