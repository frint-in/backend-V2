import { createEvent, deleteEvent, updateEvent } from "@/controllers/v1/Event";
import { createJob, deleteJob, updateJob } from "@/controllers/v1/Job";
import { signupOrganisation, updateOrganisation } from "@/controllers/v1/Organisation";
import { verifyToken } from "@/utils/middleware";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

router.post("/create/:orgId", verifyToken, upload.fields([
    { name: "job_poster", maxCount: 1 },
  ]), createJob);
// router.post("/signin",signinUser);

//read

//update
router.put("/update/:orgId/:jobId", verifyToken,upload.fields([
  { name: "job_poster", maxCount: 1 },
  ]), updateJob);

//delete
router.delete("/delete/:orgId/:jobId", verifyToken, deleteJob);


export default router;
