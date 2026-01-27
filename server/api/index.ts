import "dotenv/config";
import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import adminRoutes from "../src/routes/admin.routes";
import matchRoutes from "../src/routes/match.routes";
import captainAuthRoutes from "../src/routes/captainAuth.routes";
import announcementRoutes from "../src/routes/announcement.routes";
import galleryRoutes from "../src/routes/gallery.routes";
import scheduleRoutes from "../src/routes/schedule.routes";
import ruleRoutes from "../src/routes/rule.routes";

const app = express();

// CORS configuration - Allow all origins with proper preflight handling
const corsOptions = {
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());

// MongoDB connection cache
let cachedDb: typeof mongoose | null = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  const MONGO_URI = process.env.MONGO_URI || "";
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  cachedDb = await mongoose.connect(MONGO_URI);
  return cachedDb;
}

// DB middleware with proper error handling
const dbMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error("Database connection error:", error.message);
    return res.status(500).json({ 
      error: "Database connection failed", 
      message: error.message 
    });
  }
};

// Health routes
app.get("/", (_req, res) => res.json({ message: "Apex Sports API", version: "1.0.0" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api", (_req, res) => res.json({ message: "Apex Sports API", status: "online" }));

// Routes with /api prefix (matching frontend expectations)
app.use("/api/admin", dbMiddleware, adminRoutes);
app.use("/api/matches", dbMiddleware, matchRoutes);
app.use("/api/captain-auth", dbMiddleware, captainAuthRoutes);
app.use("/api/announcements", dbMiddleware, announcementRoutes);
app.use("/api/gallery", dbMiddleware, galleryRoutes);
app.use("/api/schedules", dbMiddleware, scheduleRoutes);
app.use("/api/rules", dbMiddleware, ruleRoutes);

// Global error handler - ensure JSON responses
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message || "An unexpected error occurred" 
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
