import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getTeachers,
  getAllSubmissions,
} from "../controllers/admin.controller.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, allowRoles("ADMIN"));
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/teachers", getTeachers);
export default router;