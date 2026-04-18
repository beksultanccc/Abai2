import { Router } from "express";
import {
  createDirectorTask,
  listDirectorTasks,
  updateDirectorTaskStatus,
  updateDirectorTask,
  deleteDirectorTask,
  addDirectorTaskComment,
  uploadTeacherResultFiles,
} from "../controllers/director-task.controller.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  listDirectorTasks
);

router.post(
  "/",
  requireAuth,
  allowRoles("ADMIN"),
  upload.array("files", 10),
  createDirectorTask
);

router.put(
  "/:id",
  requireAuth,
  allowRoles("ADMIN"),
  upload.array("files", 10),
  updateDirectorTask
);

router.delete(
  "/:id",
  requireAuth,
  allowRoles("ADMIN"),
  deleteDirectorTask
);

router.put(
  "/:id/status",
  requireAuth,
  allowRoles("TEACHER", "ADMIN"),
  updateDirectorTaskStatus
);

router.post(
  "/:id/comments",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  addDirectorTaskComment
);

router.post(
  "/:id/result-files",
  requireAuth,
  allowRoles("TEACHER"),
  upload.array("files", 10),
  uploadTeacherResultFiles
);

export default router;