import { Router } from "express";
import {
  getCaptainTeams,
  getCaptainTeamById,
  createCaptainTeam,
  updateCaptainTeam,
  deleteCaptainTeam,
  addPlayersToTeam,
  removePlayerFromTeam,
  getAvailablePlayers,
} from "../controllers/captainTeam.controller";
import { captainAuthMiddleware } from "../middlewares/captainAuth";

const router = Router();

// All routes are protected
router.use(captainAuthMiddleware);

// Team CRUD
router.get("/", getCaptainTeams);
router.get("/available-players", getAvailablePlayers);
router.get("/:id", getCaptainTeamById);
router.post("/", createCaptainTeam);
router.put("/:id", updateCaptainTeam);
router.delete("/:id", deleteCaptainTeam);

// Player management within teams
router.post("/:id/players", addPlayersToTeam);
router.delete("/:id/players/:playerId", removePlayerFromTeam);

export default router;
