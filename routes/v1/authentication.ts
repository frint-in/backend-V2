import { linkGoogleAccount, signinGoogle } from "@/controllers/v1/authentication";
import { verifyOrganisationToken, verifyToken } from "@/utils/middleware";
import express from "express"

const router = express.Router();

router.post("/signingoogle", signinGoogle)
router.post("/linkGoogleAccount",verifyToken, linkGoogleAccount);
// router.post("/linkGoogleAccountCompany", verifyOrganisationToken, linkGoogleAccountCompany);

export default router;
