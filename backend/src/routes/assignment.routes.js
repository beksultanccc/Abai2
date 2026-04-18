import { Router } from "express";
import { submitAssignment } from "../controllers/assignment.controller.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { submitAssignmentSchema } from "../schemas/submission.schemas.js";

const router = Router();
router.post("/:id/submit", requireAuth, allowRoles("STUDENT"), upload.array("files", 10), validate(submitAssignmentSchema), submitAssignment);
export default router;
