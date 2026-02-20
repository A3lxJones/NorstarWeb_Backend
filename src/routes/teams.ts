import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { authenticate, authorize } from "../middleware/auth";
import { getMissingFields, isValidUUID } from "../utils/validation";
import { ApiResponse } from "../types";

const router = Router();

router.use(authenticate);

/**
 * GET /api/teams
 * List all teams. Everyone can see teams.
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
    const { data, error } = await supabaseAdmin
        .from("teams")
        .select("*, coach:profiles(id, full_name, email)")
        .order("name");

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * GET /api/teams/:id
 * Get a single team with its registered children.
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid team ID" } as ApiResponse);
        return;
    }

    const { data: team, error } = await supabaseAdmin
        .from("teams")
        .select("*, coach:profiles(id, full_name, email)")
        .eq("id", req.params.id)
        .single();

    if (error || !team) {
        res.status(404).json({ success: false, error: "Team not found" } as ApiResponse);
        return;
    }

    // Also fetch registered children
    const { data: registrations } = await supabaseAdmin
        .from("team_registrations")
        .select("*, child:children(id, first_name, last_name, date_of_birth, skill_level, position)")
        .eq("team_id", req.params.id)
        .eq("status", "approved");

    res.json({ success: true, data: { ...team, members: registrations || [] } } as ApiResponse);
});

/**
 * POST /api/teams
 * Create a new team (admin/coach only).
 */
router.post(
    "/",
    authorize("admin", "coach"),
    async (req: Request, res: Response): Promise<void> => {
        const missing = getMissingFields(req.body, ["name", "age_group"]);
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                error: `Missing required fields: ${missing.join(", ")}`,
            } as ApiResponse);
            return;
        }

        const { data, error } = await supabaseAdmin
            .from("teams")
            .insert({
                name: req.body.name,
                age_group: req.body.age_group,
                coach_id: req.body.coach_id || (req.userRole === "coach" ? req.userId : null),
            })
            .select()
            .single();

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.status(201).json({ success: true, data } as ApiResponse);
    }
);

/**
 * POST /api/teams/:id/register
 * Register a child for a team (parent submits, coach/admin approves).
 * Body: { child_id }
 */
router.post(
    "/:id/register",
    authorize("parent"),
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id) || !isValidUUID(req.body.child_id)) {
            res.status(400).json({ success: false, error: "Invalid team or child ID" } as ApiResponse);
            return;
        }

        // Verify parent owns the child
        const { data: child } = await supabaseAdmin
            .from("children")
            .select("parent_id")
            .eq("id", req.body.child_id)
            .single();

        if (!child || child.parent_id !== req.userId) {
            res.status(403).json({ success: false, error: "You can only register your own children" } as ApiResponse);
            return;
        }

        // Check for existing registration
        const { data: existing } = await supabaseAdmin
            .from("team_registrations")
            .select("id")
            .eq("team_id", req.params.id)
            .eq("child_id", req.body.child_id)
            .maybeSingle();

        if (existing) {
            res.status(409).json({ success: false, error: "Child is already registered for this team" } as ApiResponse);
            return;
        }

        const { data, error } = await supabaseAdmin
            .from("team_registrations")
            .insert({
                team_id: req.params.id,
                child_id: req.body.child_id,
                registered_by: req.userId,
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.status(201).json({ success: true, data, message: "Registration submitted for approval" } as ApiResponse);
    }
);

/**
 * PATCH /api/teams/registrations/:id/approve
 * Approve or reject a team registration (coach/admin only).
 * Body: { status: "approved" | "rejected" }
 */
router.patch(
    "/registrations/:id/approve",
    authorize("admin", "coach"),
    async (req: Request, res: Response): Promise<void> => {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            res.status(400).json({ success: false, error: "Status must be 'approved' or 'rejected'" } as ApiResponse);
            return;
        }

        const { data, error } = await supabaseAdmin
            .from("team_registrations")
            .update({ status })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.json({ success: true, data } as ApiResponse);
    }
);

/**
 * PUT /api/teams/:id
 * Update team details (admin/coach only).
 */
router.put(
    "/:id",
    authorize("admin", "coach"),
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid team ID" } as ApiResponse);
            return;
        }

        const { id: _id, created_at: _ca, ...updateData } = req.body;

        const { data, error } = await supabaseAdmin
            .from("teams")
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.json({ success: true, data } as ApiResponse);
    }
);

/**
 * DELETE /api/teams/:id
 * Delete a team (admin only).
 */
router.delete(
    "/:id",
    authorize("admin"),
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid team ID" } as ApiResponse);
            return;
        }

        const { error } = await supabaseAdmin
            .from("teams")
            .delete()
            .eq("id", req.params.id);

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.json({ success: true, message: "Team deleted" } as ApiResponse);
    }
);

export default router;
