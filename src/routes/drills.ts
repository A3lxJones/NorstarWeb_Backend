import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { authenticate, authorize } from "../middleware/auth";
import { getMissingFields, isValidUUID } from "../utils/validation";
import { ApiResponse, CreateDrillDTO, DrillCategory, DrillSkillLevel } from "../types";

const router = Router();

router.use(authenticate);

const VALID_CATEGORIES: DrillCategory[] = [
    "skating",
    "stick_control",
    "shooting",
    "passing",
    "conditioning",
    "teamwork",
];

const VALID_SKILL_LEVELS: DrillSkillLevel[] = ["beginner", "intermediate", "advanced"];

/**
 * GET /api/drills
 * List all drills. Optional filters: ?category=...&skill_level=...&difficulty=...
 * Accessible to authenticated users (coaches/admins).
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    let query = supabaseAdmin
        .from("drills")
        .select("*");

    // Optional filters
    if (req.query.category && typeof req.query.category === "string") {
        query = query.eq("category", req.query.category);
    }

    if (req.query.skill_level && typeof req.query.skill_level === "string") {
        query = query.eq("skill_level", req.query.skill_level);
    }

    if (req.query.difficulty && typeof req.query.difficulty === "string") {
        const difficulty = parseInt(req.query.difficulty, 10);
        if (!isNaN(difficulty) && difficulty >= 1 && difficulty <= 5) {
            query = query.eq("difficulty", difficulty);
        }
    }

    // Difficulty range: ?min_difficulty=2&max_difficulty=4
    if (req.query.min_difficulty && typeof req.query.min_difficulty === "string") {
        const minDiff = parseInt(req.query.min_difficulty, 10);
        if (!isNaN(minDiff)) {
            query = query.gte("difficulty", minDiff);
        }
    }

    if (req.query.max_difficulty && typeof req.query.max_difficulty === "string") {
        const maxDiff = parseInt(req.query.max_difficulty, 10);
        if (!isNaN(maxDiff)) {
            query = query.lte("difficulty", maxDiff);
        }
    }

    query = query.order("category", { ascending: true }).order("difficulty", { ascending: true });

    const { data, error } = await query;

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * GET /api/drills/:id
 * Get a single drill by ID.
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid drill ID" } as ApiResponse);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("drills")
        .select("*")
        .eq("id", req.params.id)
        .single();

    if (error || !data) {
        res.status(404).json({ success: false, error: "Drill not found" } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * POST /api/drills
 * Create a new drill (admin only).
 */
router.post(
    "/",
    authorize("admin"),
    async (req: Request, res: Response): Promise<void> => {
        const missing = getMissingFields(req.body, [
            "name",
            "description",
            "instructions",
            "category",
            "skill_level",
            "difficulty",
        ]);

        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                error: `Missing required fields: ${missing.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Validate category
        if (!VALID_CATEGORIES.includes(req.body.category)) {
            res.status(400).json({
                success: false,
                error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Validate skill level
        if (!VALID_SKILL_LEVELS.includes(req.body.skill_level)) {
            res.status(400).json({
                success: false,
                error: `skill_level must be one of: ${VALID_SKILL_LEVELS.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Validate difficulty
        const difficulty = parseInt(req.body.difficulty, 10);
        if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
            res.status(400).json({
                success: false,
                error: "difficulty must be an integer between 1 and 5",
            } as ApiResponse);
            return;
        }

        const drillData: CreateDrillDTO = {
            name: req.body.name,
            description: req.body.description,
            instructions: req.body.instructions,
            category: req.body.category,
            skill_level: req.body.skill_level,
            difficulty,
            duration_minutes: req.body.duration_minutes || null,
            equipment: req.body.equipment || null,
            max_players: req.body.max_players || null,
            notes: req.body.notes || null,
        };

        const { data, error } = await supabaseAdmin
            .from("drills")
            .insert(drillData)
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
 * PUT /api/drills/:id
 * Update a drill (admin only).
 */
router.put(
    "/:id",
    authorize("admin"),
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid drill ID" } as ApiResponse);
            return;
        }

        // Validate category if provided
        if (req.body.category && !VALID_CATEGORIES.includes(req.body.category)) {
            res.status(400).json({
                success: false,
                error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Validate skill level if provided
        if (req.body.skill_level && !VALID_SKILL_LEVELS.includes(req.body.skill_level)) {
            res.status(400).json({
                success: false,
                error: `skill_level must be one of: ${VALID_SKILL_LEVELS.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Validate difficulty if provided
        if (req.body.difficulty) {
            const difficulty = parseInt(req.body.difficulty, 10);
            if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
                res.status(400).json({
                    success: false,
                    error: "difficulty must be an integer between 1 and 5",
                } as ApiResponse);
                return;
            }
        }

        const { id: _id, created_at: _ca, ...updateData } = req.body;

        const { data, error } = await supabaseAdmin
            .from("drills")
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
 * DELETE /api/drills/:id
 * Delete a drill (admin only).
 */
router.delete(
    "/:id",
    authorize("admin"),
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid drill ID" } as ApiResponse);
            return;
        }

        const { error } = await supabaseAdmin
            .from("drills")
            .delete()
            .eq("id", req.params.id);

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.json({ success: true, message: "Drill deleted" } as ApiResponse);
    }
);

export default router;
