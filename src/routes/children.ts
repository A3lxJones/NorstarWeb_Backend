import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { authenticate, authorize } from "../middleware/auth";
import { getMissingFields, isValidUUID } from "../utils/validation";
import { ApiResponse, CreateChildDTO } from "../types";

const router = Router();

// All children routes require authentication
router.use(authenticate);

const REQUIRED_CHILD_FIELDS = [
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_contact_relationship",
];

/**
 * GET /api/children
 * Parents see their own children. Coaches/admins see all.
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    let query = supabaseAdmin.from("children").select("*");

    // Parents can only see their own children
    if (req.userRole === "parent") {
        query = query.eq("parent_id", req.userId!);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * GET /api/children/:id
 * Get a single child. Parents can only view their own.
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid child ID" } as ApiResponse);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("children")
        .select("*")
        .eq("id", req.params.id)
        .single();

    if (error || !data) {
        res.status(404).json({ success: false, error: "Child not found" } as ApiResponse);
        return;
    }

    // Parents can only see their own children
    if (req.userRole === "parent" && data.parent_id !== req.userId) {
        res.status(403).json({ success: false, error: "Access denied" } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * POST /api/children
 * Register a new child (parents only — linked to their account).
 */
router.post(
    "/",
    authorize("parent"),
    async (req: Request, res: Response): Promise<void> => {
        const missing = getMissingFields(req.body, REQUIRED_CHILD_FIELDS);
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                error: `Missing required fields: ${missing.join(", ")}`,
            } as ApiResponse);
            return;
        }

        const childData: CreateChildDTO & { parent_id: string } = {
            ...req.body,
            parent_id: req.userId!,
            photo_consent: req.body.photo_consent ?? false,
        };

        const { data, error } = await supabaseAdmin
            .from("children")
            .insert(childData)
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
 * PUT /api/children/:id
 * Update a child's details. Parents can update their own children only.
 */
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid child ID" } as ApiResponse);
        return;
    }

    // Check ownership for parents
    if (req.userRole === "parent") {
        const { data: existing } = await supabaseAdmin
            .from("children")
            .select("parent_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.parent_id !== req.userId) {
            res.status(403).json({ success: false, error: "Access denied" } as ApiResponse);
            return;
        }
    }

    // Strip fields that shouldn't be updated directly
    const { id: _id, parent_id: _pid, created_at: _ca, ...updateData } = req.body;

    const { data, error } = await supabaseAdmin
        .from("children")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .select()
        .single();

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

/**
 * DELETE /api/children/:id
 * Remove a child record. Parents delete their own; admins can delete any.
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid child ID" } as ApiResponse);
        return;
    }

    if (req.userRole === "parent") {
        const { data: existing } = await supabaseAdmin
            .from("children")
            .select("parent_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.parent_id !== req.userId) {
            res.status(403).json({ success: false, error: "Access denied" } as ApiResponse);
            return;
        }
    }

    const { error } = await supabaseAdmin
        .from("children")
        .delete()
        .eq("id", req.params.id);

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    res.json({ success: true, message: "Child record deleted" } as ApiResponse);
});

export default router;
