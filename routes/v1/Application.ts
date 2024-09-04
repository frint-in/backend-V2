import { updateApplicationStatus } from "@/controllers/v1/Application";
import { verifyToken } from "@/utils/middleware";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

//change status of job
router.put("/:applicationId/:jobId",upload.fields([
    { name: "resume", maxCount: 1 }]), verifyToken, updateApplicationStatus )
  


export default router;
