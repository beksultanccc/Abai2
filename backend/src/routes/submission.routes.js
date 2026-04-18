import { Router } from "express";
import {
  createSubmission,
  listMySubmissions,
  gradeSubmission,
  listSubmissionsForReview,
} from "../controllers/submission.controller.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get(
  "/mine",
  requireAuth,
  allowRoles("STUDENT"),
  listMySubmissions
);

router.get(
  "/for-review",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  listSubmissionsForReview
);

router.post(
  "/:assignmentId",
  requireAuth,
  allowRoles("STUDENT"),
  upload.array("files", 10),
  createSubmission
);

router.put(
  "/:submissionId/grade",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  gradeSubmission
);

export default router;