import { Router } from "express";
import {
  createAssignment,
  createCourse,
  createLesson,
  enrollCourse,
  getCourseById,
  listCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  createAssignmentSchema,
  createCourseSchema,
  createLessonSchema,
} from "../schemas/course.schemas.js";

const router = Router();

router.get("/", listCourses);
router.get("/:id", getCourseById);
router.post("/", requireAuth, allowRoles("ADMIN", "TEACHER"), validate(createCourseSchema), createCourse);
router.post("/:id/enroll", requireAuth, allowRoles("STUDENT"), enrollCourse);
router.post(
  "/:courseId/lessons",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  upload.array("files", 10),
  createLesson
);
router.post(
  "/:courseId/assignments",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  validate(createAssignmentSchema),
  createAssignment
);
router.put(
  "/:id",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  validate(createCourseSchema),
  updateCourse
);

router.delete(
  "/:id",
  requireAuth,
  allowRoles("ADMIN", "TEACHER"),
  deleteCourse
);

export default router;
