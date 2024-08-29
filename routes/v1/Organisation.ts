import { signupOrganisation, updateOrganisation } from "@/controllers/v1/Organisation";
import { verifyToken } from "@/utils/middleware";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

router.post("/signup",verifyToken, upload.fields([
    { name: "org_logo", maxCount: 1 },
  ]), signupOrganisation);
// router.post("/signin",signinUser);

//read

//update
router.put("/update/:id", verifyToken,upload.fields([
  { name: "org_logo", maxCount: 1 },
  ]), updateOrganisation);

//delete
// router.delete("/:id", verifyToken, deleteUser);

//verifyEmail
// router.post("/verifyemail", verifyUserEmail);

export default router;
