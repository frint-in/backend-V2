import { linkGoogleAccount, linkGoogleAccountOrganisation, signinGoogle } from "@/controllers/v1/authentication";
import { verifyOrganisationToken, verifyToken } from "@/utils/middleware";
import express from "express"

const router = express.Router();

router.post("/signingoogle", signinGoogle)
router.post("/linkGoogleAccountUser",verifyToken, linkGoogleAccount);
router.post("/linkGoogleAccountOrganisation", verifyOrganisationToken, linkGoogleAccountOrganisation);

export default router;
