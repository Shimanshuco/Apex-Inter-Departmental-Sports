import { Request, Response } from "express";
import { Score } from "../models/Score";

// Get all scores (public)
export const getAllScores = async (_req: Request, res: Response) => {
  try {
    const scores = await Score.find({ isActive: true }).sort({ sport: 1, category: 1 });
    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch scores", error });
  }
};

// Get score by ID
export const getScoreById = async (req: Request, res: Response) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) {
      return res.status(404).json({ success: false, message: "Score not found" });
    }
    res.status(200).json({ success: true, score });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch score", error });
  }
};

// Create score (Admin only)
export const createScore = async (req: Request, res: Response) => {
  try {
    const { sport, category, winner, runnerUp, secondRunnerUp, year } = req.body;

    // Check if score already exists for this sport + category + year
    const existingScore = await Score.findOne({ sport, category, year: year || 2026 });
    if (existingScore) {
      return res.status(400).json({ 
        success: false, 
        message: "Score already exists for this sport, category, and year. Use update instead." 
      });
    }

    const score = new Score({
      sport,
      category,
      winner,
      runnerUp,
      secondRunnerUp,
      year: year || 2026,
      isActive: true,
    });

    await score.save();
    res.status(201).json({ success: true, message: "Score created successfully", score });
  } catch (error: any) {
    console.error("Error creating score:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Score already exists for this sport and category" 
      });
    }
    res.status(500).json({ success: false, message: "Failed to create score", error });
  }
};

// Update score (Admin only)
export const updateScore = async (req: Request, res: Response) => {
  try {
    const { sport, category, winner, runnerUp, secondRunnerUp, year } = req.body;

    const score = await Score.findByIdAndUpdate(
      req.params.id,
      {
        sport,
        category,
        winner,
        runnerUp,
        secondRunnerUp,
        year,
      },
      { new: true }
    );

    if (!score) {
      return res.status(404).json({ success: false, message: "Score not found" });
    }

    res.status(200).json({ success: true, message: "Score updated successfully", score });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ success: false, message: "Failed to update score", error });
  }
};

// Delete score (Admin only)
export const deleteScore = async (req: Request, res: Response) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) {
      return res.status(404).json({ success: false, message: "Score not found" });
    }
    res.status(200).json({ success: true, message: "Score deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete score", error });
  }
};

// Get scores by sport
export const getScoresBySport = async (req: Request, res: Response) => {
  try {
    const scores = await Score.find({ 
      sport: { $regex: new RegExp(`^${req.params.sport}`, 'i') },
      isActive: true 
    });
    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch scores", error });
  }
};

// Get scores by category
export const getScoresByCategory = async (req: Request, res: Response) => {
  try {
    const scores = await Score.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ sport: 1 });
    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch scores", error });
  }
};
