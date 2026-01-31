import "dotenv/config";
import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import adminRoutes from "../src/routes/admin.routes";
import matchRoutes from "../src/routes/match.routes";
import captainAuthRoutes from "../src/routes/captainAuth.routes";
import captainTeamRoutes from "../src/routes/captainTeam.routes";
import teamRoutes from "../src/routes/team.routes";
import announcementRoutes from "../src/routes/announcement.routes";
import galleryRoutes from "../src/routes/gallery.routes";
import scheduleRoutes from "../src/routes/schedule.routes";
import ruleRoutes from "../src/routes/rule.routes";
import { Team } from "../src/models/Team";

const app = express();

// CORS configuration - Allow all origins with proper preflight handling
const corsOptions = {
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));


app.options("/{*path}", cors(corsOptions));

// Middleware
app.use(express.json());

// MongoDB connection cache
let cachedDb: typeof mongoose | null = null;
let migrationDone = false;

// Migration function to fix teams without gender
async function migrateTeamsIfNeeded() {
  if (migrationDone) return;
  
  try {
    const collection = Team.collection;
    
    // Get existing indexes
    const indexes = await collection.indexes();
    
    // Check if old index exists (sport + department without gender)
    const oldIndex = indexes.find((idx: any) => 
      idx.key && 
      idx.key.sport === 1 && 
      idx.key.department === 1 && 
      !idx.key.gender &&
      idx.unique === true
    );
    
    if (oldIndex) {
      console.log("🔄 Dropping old team index (sport + department)...");
      await collection.dropIndex(oldIndex.name);
      console.log("✅ Old index dropped successfully");
    }
    
    // Migrate old teams without gender field - set them to "Boys" as default
    const result = await Team.updateMany(
      { 
        $or: [
          { gender: { $exists: false } },
          { gender: null },
          { gender: "" }
        ]
      },
      { $set: { gender: "Boys" } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Migrated ${result.modifiedCount} teams to have gender field`);
    }
    
    // Sync indexes
    await Team.syncIndexes();
    
    migrationDone = true;
  } catch (error) {
    console.error("⚠️ Migration error:", error);
    // Don't fail, continue anyway
  }
}

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    // Still run migration check even if already connected
    await migrateTeamsIfNeeded();
    return cachedDb;
  }
  const MONGO_URI = process.env.MONGO_URI || "";
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  cachedDb = await mongoose.connect(MONGO_URI);
  
  // Run migration after connecting
  await migrateTeamsIfNeeded();
  
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
app.use("/api/captain-teams", dbMiddleware, captainTeamRoutes);
app.use("/api/teams", dbMiddleware, teamRoutes);
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
