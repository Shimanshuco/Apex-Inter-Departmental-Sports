import { Response } from "express";
import { Match } from "../models/Match";
import { AuthRequest } from "../middlewares/auth";

export const getAllMatches = async (req: AuthRequest, res: Response) => {
  try {
    const { status, sport } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (sport) filter.sport = sport;

    const matches = await Match.find(filter)
      .sort({ date: -1 });
    res.status(200).json({ matches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.status(200).json({ match });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { date, teamA, teamB, sport, venue } = req.body;

    if (!date || !teamA || !teamB || !sport) {
      return res
        .status(400)
        .json({ error: "Date, teams, and sport are required" });
    }

    const match = await Match.create({
      date,
      teamA,
      teamB,
      sport,
      venue,
      status: "scheduled",
    });

    res.status(201).json({ message: "Match created successfully", match });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const match = await Match.findByIdAndUpdate(id, updates, { new: true });
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.status(200).json({ message: "Match updated successfully", match });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { scoreA, scoreB, status } = req.body;

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Update match
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = status || "completed";
    await match.save();

    const updatedMatch = await Match.findById(id);

    res.status(200).json({ message: "Score updated successfully", match: updatedMatch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findByIdAndDelete(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
