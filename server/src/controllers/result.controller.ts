import { Request, Response } from "express";
import Result from "../models/Result";

// Get active result
export const getResult = async (_req: Request, res: Response) => {
  try {
    const result = await Result.findOne({ isActive: true });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch result", error });
  }
};

// Create or Update result (Admin only)
export const upsertResult = async (req: Request, res: Response) => {
  try {
    const { champion, runnerUp, thirdPlace, year } = req.body;

    // Deactivate any existing active result
    await Result.updateMany({ isActive: true }, { isActive: false });

    const result = new Result({
      champion: champion,
      runnerUp: runnerUp,
      thirdPlace: thirdPlace,
      year: year || 2026,
      isActive: true,
    });

    await result.save();
    res.status(201).json({ success: true, message: "Result saved successfully", data: result });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ success: false, message: "Failed to save result", error });
  }
};

// Update result (Admin only)
export const updateResult = async (req: Request, res: Response) => {
  try {
    const { champion, runnerUp, thirdPlace, year } = req.body;

    const result = await Result.findOneAndUpdate(
      { isActive: true },
      {
        champion: champion,
        runnerUp: runnerUp,
        thirdPlace: thirdPlace,
        year: year || 2026,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Result updated successfully", data: result });
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).json({ success: false, message: "Failed to update result", error });
  }
};

// Delete result (Admin only)
export const deleteResult = async (_req: Request, res: Response) => {
  try {
    await Result.updateMany({ isActive: true }, { isActive: false });
    res.status(200).json({ success: true, message: "Result removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete result", error });
  }
};
