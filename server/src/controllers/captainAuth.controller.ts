import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Captain } from "../models/Captain";
import { DepartmentPlayer, SPORTS_LIST } from "../models/DepartmentPlayer";

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

// Register a new captain
export const registerCaptain = async (req: CaptainRequest, res: Response) => {
  try {
    const { name, email, password, rNumber, phone, department, bloodGroup, gender, year } = req.body;

    if (!name || !email || !password || !rNumber || !phone || !department || !bloodGroup || !gender || !year) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if captain with same email or rNumber exists
    const existingCaptain = await Captain.findOne({
      $or: [{ email }, { rNumber }]
    });
    if (existingCaptain) {
      return res.status(400).json({ error: "Captain with this email or R-Number already exists" });
    }

    // Generate unique ID: APX-<LAST 4 OF R NUMBER>-<RANDOM PART><TIMEPART>
    function randomString(length: number) {
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
    const last4 = rNumber.slice(-4);
    const rand = randomString(3);
    const time = Date.now().toString().slice(-6);
    const uniqueId = `APX-${last4}-${rand}${time}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const captain = await Captain.create({
      name,
      email,
      password: hashedPassword,
      rNumber,
      uniqueId,
      phone,
      department,
      bloodGroup,
      gender,
      year,
      status: "pending",
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      captain: {
        id: captain._id,
        name: captain.name,
        email: captain.email,
        rNumber: captain.rNumber,
        uniqueId: captain.uniqueId,
        department: captain.department,
        status: captain.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Login captain
export const loginCaptain = async (req: CaptainRequest, res: Response) => {
  try {
    const { email, identifier, password } = req.body;
    // Accept login with email, rNumber, or uniqueId
    const loginValue = email || identifier;

    if (!loginValue || !password) {
      return res.status(400).json({ error: "Email / R-Number / Captain ID and password are required" });
    }

    const captain = await Captain.findOne({
      $or: [
        { email: loginValue },
        { rNumber: loginValue },
        { uniqueId: loginValue }
      ]
    });
    if (!captain) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, captain.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if captain is approved
    if (captain.status === "pending") {
      return res.status(403).json({ error: "Your account is pending approval" });
    }
    if (captain.status === "rejected") {
      return res.status(403).json({ error: "Your account has been rejected" });
    }
    if (captain.status === "inactive") {
      return res.status(403).json({ error: "Your account is inactive" });
    }

    const token = jwt.sign(
      { captainId: captain._id, email: captain.email, department: captain.department, role: "captain" },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      captain: {
        id: captain._id,
        name: captain.name,
        email: captain.email,
        rNumber: captain.rNumber,
        uniqueId: captain.uniqueId,
        phone: captain.phone,
        department: captain.department,
        bloodGroup: captain.bloodGroup,
        gender: captain.gender,
        year: captain.year,
        status: captain.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get captain profile
export const getCaptainProfile = async (req: CaptainRequest, res: Response) => {
  try {
    const captain = await Captain.findById(req.captain?.captainId).select("-password");
    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }
    res.status(200).json({
      captain: {
        id: captain._id,
        name: captain.name,
        email: captain.email,
        rNumber: captain.rNumber,
        uniqueId: captain.uniqueId,
        phone: captain.phone,
        department: captain.department,
        bloodGroup: captain.bloodGroup,
        gender: captain.gender,
        year: captain.year,
        status: captain.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update captain profile
export const updateCaptainProfile = async (req: CaptainRequest, res: Response) => {
  try {
    const { name, phone, bloodGroup } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bloodGroup) updates.bloodGroup = bloodGroup;

    const captain = await Captain.findByIdAndUpdate(
      req.captain?.captainId,
      updates,
      { new: true }
    ).select("-password");

    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      captain: {
        id: captain._id,
        name: captain.name,
        email: captain.email,
        rNumber: captain.rNumber,
        uniqueId: captain.uniqueId,
        phone: captain.phone,
        department: captain.department,
        bloodGroup: captain.bloodGroup,
        gender: captain.gender,
        year: captain.year,
        status: captain.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get sports list
export const getSportsList = async (_req: CaptainRequest, res: Response) => {
  res.status(200).json({ sports: SPORTS_LIST });
};

// Get department players (for the captain's department)
export const getDepartmentPlayers = async (req: CaptainRequest, res: Response) => {
  try {
    const players = await DepartmentPlayer.find({ captain: req.captain?.captainId })
      .populate("captain", "name email uniqueId department")
      .sort({ createdAt: -1 });

    res.status(200).json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Add department player
export const addDepartmentPlayer = async (req: CaptainRequest, res: Response) => {
  try {
    const { name, rNumber, phone, email, sport, gender, year } = req.body;

    if (!name || !rNumber || !phone || !email || !sport || !gender || !year) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get captain's department
    const captain = await Captain.findById(req.captain?.captainId);
    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    // Check if player with same rNumber is already registered in this sport
    const existingPlayer = await DepartmentPlayer.findOne({ rNumber, sport });
    if (existingPlayer) {
      return res.status(400).json({ error: "This player is already registered for this sport" });
    }

    // Check if player is already in 2 sports (max limit)
    const playerSportsCount = await DepartmentPlayer.countDocuments({ rNumber });
    if (playerSportsCount >= 2) {
      return res.status(400).json({ error: "This player is already registered in 2 sports (maximum limit)" });
    }

    // Generate unique ID: PLY-<captainfirstname>-<randompart><time>
    function randomString(length: number) {
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
    const captainFirst = (captain.name || "captain").split(" ")[0].toLowerCase();
    const rand = randomString(3);
    const time = Date.now().toString().slice(-6);
    const uniqueId = `PLY-${captainFirst}-${rand}${time}`;

    const player = await DepartmentPlayer.create({
      name,
      rNumber,
      uniqueId,
      phone,
      email,
      sport,
      gender,
      year,
      department: captain.department,
      captain: captain._id,
      status: "pending",
    });

    const populatedPlayer = await DepartmentPlayer.findById(player._id)
      .populate("captain", "name email uniqueId department");

    res.status(201).json({
      message: "Player added successfully. Pending admin approval.",
      player: populatedPlayer,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update department player
export const updateDepartmentPlayer = async (req: CaptainRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, sport } = req.body;

    // Verify the player belongs to this captain
    const player = await DepartmentPlayer.findOne({ _id: id, captain: req.captain?.captainId });
    if (!player) {
      return res.status(404).json({ error: "Player not found or you don't have permission" });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (sport) updates.sport = sport;

    const updatedPlayer = await DepartmentPlayer.findByIdAndUpdate(id, updates, { new: true })
      .populate("captain", "name email uniqueId department");

    res.status(200).json({
      message: "Player updated successfully",
      player: updatedPlayer,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Delete department player
export const deleteDepartmentPlayer = async (req: CaptainRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify the player belongs to this captain
    const player = await DepartmentPlayer.findOne({ _id: id, captain: req.captain?.captainId });
    if (!player) {
      return res.status(404).json({ error: "Player not found or you don't have permission" });
    }

    await DepartmentPlayer.findByIdAndDelete(id);

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
