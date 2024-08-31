import { createEvent } from "@/controllers/v1/Event";
import { signupOrganisation, updateOrganisation } from "@/controllers/v1/Organisation";
import { verifyToken } from "@/utils/middleware";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

router.post("/create/:orgId", verifyToken, upload.fields([
    { name: "event_poster", maxCount: 1 },
  ]), createEvent);
// router.post("/signin",signinUser);

//read

//update
router.put("/update/:id", verifyToken,upload.fields([
  { name: "org_logo", maxCount: 1 },
  ]), updateOrganisation);

//delete
// router.delete("/:id", verifyToken, deleteUser);


export default router;
