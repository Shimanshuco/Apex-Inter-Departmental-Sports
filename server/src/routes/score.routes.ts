import { Router } from "express";
import {
  getAllScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore,
  getScoresBySport,
  getScoresByCategory,
} from "../controllers/score.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Public routes
router.get("/", getAllScores);
router.get("/sport/:sport", getScoresBySport);
router.get("/category/:category", getScoresByCategory);
router.get("/:id", getScoreById);

// Admin routes (protected)
router.post("/", authMiddleware, createScore);
router.put("/:id", authMiddleware, updateScore);
router.delete("/:id", authMiddleware, deleteScore);

export default router;
