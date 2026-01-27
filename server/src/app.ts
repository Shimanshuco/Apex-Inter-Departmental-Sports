import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes";
import matchRoutes from "./routes/match.routes";
import captainAuthRoutes from "./routes/captainAuth.routes";
import captainTeamRoutes from "./routes/captainTeam.routes";
import teamRoutes from "./routes/team.routes";
import announcementRoutes from "./routes/announcement.routes";
import galleryRoutes from "./routes/gallery.routes";
import scheduleRoutes from "./routes/schedule.routes";
import ruleRoutes from "./routes/rule.routes";

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
app.options("/{*path}", cors(corsOptions));

// Middleware
app.use(express.json());

// Routes with /api prefix
app.use("/api/admin", adminRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/captain-auth", captainAuthRoutes);
app.use("/api/captain-teams", captainTeamRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/rules", ruleRoutes);



// Root route
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Apex Sports API is running!", version: "1.0.0" });
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "API is running" });
});

// API root
app.get("/api", (_req, res) => {
  res.status(200).json({ message: "Apex Sports API", status: "online" });
});

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
