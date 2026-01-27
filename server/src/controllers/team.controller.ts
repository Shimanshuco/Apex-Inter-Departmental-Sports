import { Request, Response } from "express";
import { Team } from "../models/Team";
import { DepartmentPlayer } from "../models/DepartmentPlayer";

// Get all teams (admin view)
export const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await Team.find()
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status department")
      .sort({ department: 1, sport: 1 });

    res.json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch teams" });
  }
};

// Get a single team by ID
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status department");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ team });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch team" });
  }
};

// Update a team (admin can update any team)
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, playerIds, status } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Validate players if provided
    if (playerIds !== undefined) {
      if (playerIds.length > 15) {
        return res.status(400).json({ error: "Maximum 15 players allowed per team" });
      }

      if (playerIds.length > 0) {
        // Verify all players match the sport
        const players = await DepartmentPlayer.find({
          _id: { $in: playerIds },
          sport: team.sport,
          status: { $in: ["active", "approved"] },
        });

        if (players.length !== playerIds.length) {
          return res.status(400).json({ 
            error: "Some players are invalid or don't match the sport" 
          });
        }
      }

      team.players = playerIds;
    }

    if (name) {
      team.name = name;
    }

    if (status && ["active", "inactive", "pending"].includes(status)) {
      team.status = status;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status department");

    res.json({ message: "Team updated successfully", team: updatedTeam });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update team" });
  }
};

// Delete a team
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ message: "Team deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete team" });
  }
};

// Get teams by department
export const getTeamsByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;

    const teams = await Team.find({ department })
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status")
      .sort({ sport: 1 });

    res.json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch teams" });
  }
};

// Get teams by sport
export const getTeamsBySport = async (req: Request, res: Response) => {
  try {
    const { sport } = req.params;

    const teams = await Team.find({ sport })
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status")
      .sort({ department: 1 });

    res.json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch teams" });
  }
};

// Update team status
export const updateTeamStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("captain", "name email department uniqueId phone")
      .populate("players", "name rNumber uniqueId phone email sport status");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ message: "Team status updated", team });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update team status" });
  }
};
