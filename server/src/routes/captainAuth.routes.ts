import { Router } from "express";
import {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  updateCaptainProfile,
  addDepartmentPlayer,
  getDepartmentPlayers,
  updateDepartmentPlayer,
  deleteDepartmentPlayer,
  getSportsList,
} from "../controllers/captainAuth.controller";
import { captainAuthMiddleware } from "../middlewares/captainAuth";

const router = Router();

// Public routes
router.post("/register", registerCaptain);
router.post("/login", loginCaptain);
router.get("/sports", getSportsList);

// Protected routes (captain only)
router.get("/profile", captainAuthMiddleware, getCaptainProfile);
router.put("/profile", captainAuthMiddleware, updateCaptainProfile);

// Department Players management
router.get("/players", captainAuthMiddleware, getDepartmentPlayers);
router.post("/players", captainAuthMiddleware, addDepartmentPlayer);
router.put("/players/:id", captainAuthMiddleware, updateDepartmentPlayer);
router.delete("/players/:id", captainAuthMiddleware, deleteDepartmentPlayer);

export default router;
