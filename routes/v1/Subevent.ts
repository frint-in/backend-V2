import { createEvent, deleteEvent, updateEvent } from "@/controllers/v1/Event";
import { signupOrganisation, updateOrganisation } from "@/controllers/v1/Organisation";
import { createSubevent, deleteSubevent, updateSubevent } from "@/controllers/v1/Subevent";
import { verifyToken } from "@/utils/middleware";
import express, { Request, Response } from "express";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
  });
  
const router = express.Router();

router.post("/create/:orgId/:eventId", verifyToken,upload.fields([
  { name: "subevent_poster", maxCount: 1 },
]), createSubevent);
// router.post("/signin",signinUser);

//read

//update
router.put("/update/:orgId/:subeventId", verifyToken,upload.fields([
  { name: "subevent_poster", maxCount: 1 },
]), updateSubevent);

//delete
router.delete("/delete/:orgId/:eventId/:subeventId", verifyToken, deleteSubevent);


export default router;
