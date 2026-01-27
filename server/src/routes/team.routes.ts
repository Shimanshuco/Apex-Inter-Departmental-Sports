import { Router } from "express";
import {
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamsByDepartment,
  getTeamsBySport,
  updateTeamStatus,
} from "../controllers/team.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// All routes are protected (admin only)
router.use(authMiddleware);

// Team management
router.get("/", getAllTeams);
router.get("/department/:department", getTeamsByDepartment);
router.get("/sport/:sport", getTeamsBySport);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.put("/:id/status", updateTeamStatus);
router.delete("/:id", deleteTeam);

export default router;
