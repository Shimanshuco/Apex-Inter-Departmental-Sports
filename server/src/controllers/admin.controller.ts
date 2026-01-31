import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";
import { Captain } from "../models/Captain";
import { DepartmentPlayer } from "../models/DepartmentPlayer";
import { AuthRequest } from "../middlewares/auth";

export const adminSignup = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      username,
      password: hashedPassword,
      email,
      role: "admin",
    });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const adminLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        profileImage: admin.profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin?.id).select("-password");
    res.status(200).json({ admin });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, bio, profileImage } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin?.id,
      {
        firstName,
        lastName,
        phone,
        bio,
        profileImage,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      admin,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ============ Captain Management ============

// Get all captains
export const getAllCaptains = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const captains = await Captain.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ captains });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create captain (admin adding manually)
export const createCaptain = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, rNumber, phone, department, bloodGroup, gender, year, password } = req.body;

    if (!name || !email || !rNumber || !phone || !department || !bloodGroup || !gender || !year || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if captain already exists
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
      rNumber,
      phone,
      department,
      bloodGroup,
      gender,
      year,
      password: hashedPassword,
      uniqueId,
      status: "approved", // Admin-created captains are auto-approved
    });

    res.status(201).json({
      message: "Captain created successfully",
      captain: {
        _id: captain._id,
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
    res.status(500).json({ error: error.message });
  }
};

// Update captain status
export const updateCaptainStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const captain = await Captain.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    res.status(200).json({ message: "Captain status updated", captain });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update captain details
export const updateCaptain = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, bloodGroup, status } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bloodGroup) updates.bloodGroup = bloodGroup;
    if (status) updates.status = status;

    const captain = await Captain.findByIdAndUpdate(id, updates, { new: true }).select("-password");

    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    res.status(200).json({ message: "Captain updated successfully", captain });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete captain
export const deleteCaptain = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Also delete all players added by this captain
    await DepartmentPlayer.deleteMany({ captain: id });

    const captain = await Captain.findByIdAndDelete(id);
    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    res.status(200).json({ message: "Captain and associated players deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ============ Department Player Management ============

// Get all department players
export const getAllDepartmentPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, department, sport } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (sport) filter.sport = sport;

    const players = await DepartmentPlayer.find(filter)
      .populate("captain", "name email department uniqueId")
      .sort({ createdAt: -1 });
    res.status(200).json({ players });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create department player (admin adding manually)
export const createDepartmentPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, rNumber, phone, department, sport, captainId, gender, year } = req.body;

    if (!name || !email || !rNumber || !phone || !department || !sport || !captainId || !gender || !year) {
      return res.status(400).json({ error: "All fields are required (including gender and year)" });
    }

    // Verify captain exists
    const captain = await Captain.findById(captainId);
    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    // Check if player with same R-Number already exists in this sport
    const existingPlayer = await DepartmentPlayer.findOne({ rNumber, sport });
    if (existingPlayer) {
      return res.status(400).json({ error: "Player already registered for this sport" });
    }

    // Check max 2 sports per player
    const playerSportsCount = await DepartmentPlayer.countDocuments({ rNumber });
    if (playerSportsCount >= 2) {
      return res.status(400).json({ error: "This player is already registered in 2 sports (maximum limit)" });
    }

    // Generate unique ID: PLY-<captainfirstname>-<randompart><time>
    function randomString(length: number) {
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
    const captainObj = await Captain.findById(captainId);
    const captainFirst = (captainObj?.name || "captain").split(" ")[0].toLowerCase();
    const rand = randomString(3);
    const time = Date.now().toString().slice(-6);
    const uniqueId = `PLY-${captainFirst}-${rand}${time}`;

    const player = await DepartmentPlayer.create({
      name,
      email,
      rNumber,
      phone,
      department,
      sport,
      gender,
      year,
      captain: captainId,
      uniqueId,
      status: "approved", // Admin-created players are auto-approved
    });

    const populatedPlayer = await DepartmentPlayer.findById(player._id)
      .populate("captain", "name email department uniqueId");

    res.status(201).json({
      message: "Player created successfully",
      player: populatedPlayer,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update department player status
export const updateDepartmentPlayerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const player = await DepartmentPlayer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("captain", "name email department");

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json({ message: "Player status updated", player });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update department player details
export const updateDepartmentPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, status } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (status) updates.status = status;

    const player = await DepartmentPlayer.findByIdAndUpdate(id, updates, { new: true })
      .populate("captain", "name email department");

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json({ message: "Player updated successfully", player });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete department player
export const deleteDepartmentPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const player = await DepartmentPlayer.findByIdAndDelete(id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
