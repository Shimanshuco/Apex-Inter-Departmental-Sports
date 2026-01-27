import { Response } from "express";
import { Team } from "../models/Team";
import { DepartmentPlayer } from "../models/DepartmentPlayer";

// Extended Request interface for captain auth
interface CaptainRequest {
  captain?: {
    captainId: string;
    email: string;
    department: string;
    role: string;
  };
  body: any;
  params: any;
  query: any;
}

// Get all teams for captain's department
export const getCaptainTeams = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const department = req.captain?.department;

    if (!captainId || !department) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const teams = await Team.find({ captain: captainId })
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status")
      .sort({ sport: 1 });

    res.json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch teams" });
  }
};

// Get a single team by ID
export const getCaptainTeamById = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { id } = req.params;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const team = await Team.findOne({ _id: id, captain: captainId })
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ team });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch team" });
  }
};

// Create a new team
export const createCaptainTeam = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const department = req.captain?.department;

    if (!captainId || !department) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, sport, playerIds } = req.body;

    if (!name || !sport) {
      return res.status(400).json({ error: "Team name and sport are required" });
    }

    // Check if team already exists for this sport in this department
    const existingTeam = await Team.findOne({ sport, department });
    if (existingTeam) {
      return res.status(400).json({ 
        error: `A team for ${sport} already exists in your department` 
      });
    }

    // Validate players if provided
    let validPlayerIds: string[] = [];
    if (playerIds && playerIds.length > 0) {
      // Check max players limit
      if (playerIds.length > 15) {
        return res.status(400).json({ error: "Maximum 15 players allowed per team" });
      }

      // Verify all players belong to this captain and match the sport
      const players = await DepartmentPlayer.find({
        _id: { $in: playerIds },
        captain: captainId,
        sport: sport,
        status: { $in: ["active", "approved"] },
      });

      if (players.length !== playerIds.length) {
        return res.status(400).json({ 
          error: "Some players are invalid, don't belong to you, or don't match the sport" 
        });
      }

      validPlayerIds = playerIds;
    }

    const team = await Team.create({
      name,
      sport,
      department,
      captain: captainId,
      players: validPlayerIds,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status");

    res.status(201).json({ 
      message: "Team created successfully", 
      team: populatedTeam 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "A team for this sport already exists in your department" 
      });
    }
    res.status(500).json({ error: error.message || "Failed to create team" });
  }
};

// Update a team
export const updateCaptainTeam = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { id } = req.params;
    const { name, playerIds } = req.body;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const team = await Team.findOne({ _id: id, captain: captainId });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Validate players if provided
    if (playerIds !== undefined) {
      if (playerIds.length > 15) {
        return res.status(400).json({ error: "Maximum 15 players allowed per team" });
      }

      if (playerIds.length > 0) {
        // Verify all players belong to this captain and match the sport
        const players = await DepartmentPlayer.find({
          _id: { $in: playerIds },
          captain: captainId,
          sport: team.sport,
          status: { $in: ["active", "approved"] },
        });

        if (players.length !== playerIds.length) {
          return res.status(400).json({ 
            error: "Some players are invalid, don't belong to you, or don't match the sport" 
          });
        }
      }

      team.players = playerIds;
    }

    if (name) {
      team.name = name;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status");

    res.json({ message: "Team updated successfully", team: updatedTeam });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update team" });
  }
};

// Delete a team
export const deleteCaptainTeam = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { id } = req.params;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const team = await Team.findOneAndDelete({ _id: id, captain: captainId });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ message: "Team deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete team" });
  }
};

// Add players to a team
export const addPlayersToTeam = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { id } = req.params;
    const { playerIds } = req.body;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({ error: "Player IDs are required" });
    }

    const team = await Team.findOne({ _id: id, captain: captainId });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check max players limit
    const currentPlayersCount = team.players.length;
    if (currentPlayersCount + playerIds.length > 15) {
      return res.status(400).json({ 
        error: `Cannot add ${playerIds.length} players. Maximum 15 players allowed. Current: ${currentPlayersCount}` 
      });
    }

    // Verify players belong to this captain and match the sport
    const players = await DepartmentPlayer.find({
      _id: { $in: playerIds },
      captain: captainId,
      sport: team.sport,
      status: { $in: ["active", "approved"] },
    });

    if (players.length !== playerIds.length) {
      return res.status(400).json({ 
        error: "Some players are invalid, don't belong to you, or don't match the sport" 
      });
    }

    // Add players (avoid duplicates)
    const existingPlayerIds = team.players.map((p: any) => p.toString());
    const newPlayerIds = playerIds.filter((id: string) => !existingPlayerIds.includes(id));

    team.players.push(...newPlayerIds);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status");

    res.json({ message: "Players added successfully", team: updatedTeam });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add players" });
  }
};

// Remove a player from a team
export const removePlayerFromTeam = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { id, playerId } = req.params;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const team = await Team.findOne({ _id: id, captain: captainId });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    team.players = team.players.filter((p: any) => p.toString() !== playerId);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("captain", "name email department uniqueId")
      .populate("players", "name rNumber uniqueId phone email sport status");

    res.json({ message: "Player removed successfully", team: updatedTeam });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to remove player" });
  }
};

// Get available players for a sport (players not in any team for that sport)
export const getAvailablePlayers = async (req: CaptainRequest, res: Response) => {
  try {
    const captainId = req.captain?.captainId;
    const { sport } = req.query;

    if (!captainId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!sport) {
      return res.status(400).json({ error: "Sport is required" });
    }

    // Get all approved players for this sport belonging to this captain
    const allPlayers = await DepartmentPlayer.find({
      captain: captainId,
      sport: sport,
      status: { $in: ["active", "approved"] },
    });

    // Get the team for this sport (if exists)
    const team = await Team.findOne({ captain: captainId, sport: sport });

    // Filter out players already in the team
    let availablePlayers = allPlayers;
    if (team) {
      const teamPlayerIds = team.players.map((p: any) => p.toString());
      availablePlayers = allPlayers.filter(
        (player) => !teamPlayerIds.includes(player._id.toString())
      );
    }

    res.json({ players: availablePlayers });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch available players" });
  }
};
