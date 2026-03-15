import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import childrenRoutes from "./routes/children";
import teamsRoutes from "./routes/teams";
import gamesRoutes from "./routes/games";
import availabilityRoutes from "./routes/availability";
import availabilityRequestRoutes from "./routes/availability-requests";
import reportsRoutes from "./routes/reports";
import drillsRoutes from "./routes/drills";
import calendarRoutes from "./routes/calendar";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security middleware ────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    })
);

// Rate limiting — protect against brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 500 : 5000, // Higher limit in development
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later" },
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 30 : 300, // Higher limit in development
    message: { success: false, error: "Too many auth attempts, please try again later" },
});

// ─── Body parsing ───────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Health check ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Norstar API is running", timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/availability-requests", availabilityRequestRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/drills", drillsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Global error handler ───────────────────────────────────
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Norstar API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
