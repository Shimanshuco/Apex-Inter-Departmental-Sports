import { Router } from "express";
import {
  getResult,
  upsertResult,
  updateResult,
  deleteResult,
} from "../controllers/result.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Public route - get result
router.get("/", getResult);

// Admin routes
router.post("/", authMiddleware, upsertResult);
router.put("/", authMiddleware, updateResult);
router.delete("/", authMiddleware, deleteResult);

export default router;
