import { linkGoogleAccount, linkGoogleAccountOrganisation, signinGoogle, verifyEmail } from "@/controllers/v1/authentication";
import { verifyOrganisationToken, verifyToken } from "@/utils/middleware";
import express from "express"

const router = express.Router();

router.post("/signingoogle", signinGoogle)
router.post("/linkGoogleAccountUser",verifyToken, linkGoogleAccount);
router.post("/linkGoogleAccountOrganisation", verifyOrganisationToken, linkGoogleAccountOrganisation);
//verifyEmail
router.post("/verifyemail", verifyEmail);
export default router;
