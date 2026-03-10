import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { authenticate, authorize } from "../middleware/auth";
import { isValidEmail, isNonEmptyString, isValidUUID } from "../utils/validation";
import { ApiResponse, UserRole } from "../types";

const router = Router();

// All admin routes require authentication + admin role.
// NOTE: impersonation is ignored here — we check the REAL role (admin)
// by placing authorize("admin") BEFORE the impersonation header takes effect.
// The authenticate middleware already ran, so we guard with authorize.
router.use(authenticate);
router.use(authorize("admin"));

// ─── List all users ────────────────────────────────────────
/**
 * GET /api/admin/users
 * List all user profiles with their children (if parents).
 * Optional query: ?role=parent|coach|admin&search=<name or email>
 */
router.get("/users", async (req: Request, res: Response): Promise<void> => {
    const { role, search } = req.query;

    // Fetch all profiles with nested children
    let query = supabaseAdmin
        .from("profiles")
        .select("*, children!children_parent_id_fkey(id, first_name, last_name, date_of_birth, skill_level, position)");

    // Filter by role if provided
    if (role && typeof role === "string") {
        query = query.eq("role", role);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    // Filter by search (name or email) in JS for flexibility
    let filtered = data || [];
    if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
            (user: any) =>
                user.full_name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
        );
    }

    res.json({ success: true, data: filtered } as ApiResponse);
});

// ─── Get a single user ─────────────────────────────────────
/**
 * GET /api/admin/users/:id
 * Get a user's full profile including all their children with medical/emergency details.
 */
router.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid user ID" } as ApiResponse);
        return;
    }

    // Include full children details for parents
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select(
            `*,
             children!children_parent_id_fkey(
               id, first_name, last_name, date_of_birth, gender, skill_level, position,
               medical_conditions, allergies, emergency_contact_name, emergency_contact_phone,
               emergency_contact_relationship, photo_consent, created_at, updated_at
             )`
        )
        .eq("id", req.params.id)
        .single();

    if (error || !data) {
        res.status(404).json({ success: false, error: "User not found" } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

// ─── Change a user's role ──────────────────────────────────
/**
 * PATCH /api/admin/users/:id/role
 * Body: { role: "parent" | "coach" | "admin" }
 */
router.patch(
    "/users/:id/role",
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" } as ApiResponse);
            return;
        }

        const { role } = req.body;
        const validRoles: UserRole[] = ["parent", "coach", "admin"];

        if (!role || !validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                error: `role must be one of: ${validRoles.join(", ")}`,
            } as ApiResponse);
            return;
        }

        // Update the profile table
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({ role, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        // Also update the Supabase auth user_metadata so the role stays in sync
        await supabaseAdmin.auth.admin.updateUserById(req.params.id as string, {
            user_metadata: { role },
        });

        res.json({ success: true, data, message: `Role updated to ${role}` } as ApiResponse);
    }
);

// ─── Create a coach account ────────────────────────────────
/**
 * POST /api/admin/users/create-coach
 * Only admins can create coach accounts directly (with auto-confirm).
 * Body: { email, password, full_name, phone? }
 */
router.post(
    "/users/create-coach",
    async (req: Request, res: Response): Promise<void> => {
        const { email, password, full_name, phone } = req.body;

        if (!isValidEmail(email) || !isNonEmptyString(password) || !isNonEmptyString(full_name)) {
            res.status(400).json({
                success: false,
                error: "email, password, and full_name are required",
            } as ApiResponse);
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters",
            } as ApiResponse);
            return;
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // coaches get auto-confirmed by admin
            user_metadata: {
                full_name,
                phone: phone || null,
                role: "coach",
            },
        });

        if (error) {
            const status = error.message.includes("already") ? 409 : 400;
            res.status(status).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        // Belt-and-braces profile upsert
        if (data.user) {
            await supabaseAdmin.from("profiles").upsert({
                id: data.user.id,
                email,
                full_name,
                phone: phone || null,
                role: "coach",
            });
        }

        res.status(201).json({
            success: true,
            data: { userId: data.user?.id, email },
            message: "Coach account created",
        } as ApiResponse);
    }
);

// ─── List all children (admin view) ────────────────────────
/**
 * GET /api/admin/children
 * List all registered children with their parent info.
 * Optional query: ?search=<name>&age_group=<group>
 */
router.get("/children", async (req: Request, res: Response): Promise<void> => {
    const { search } = req.query;

    const { data, error } = await supabaseAdmin
        .from("children")
        .select(
            `*,
             parent:profiles!children_parent_id_fkey(id, full_name, email, phone)`
        )
        .order("created_at", { ascending: false });

    if (error) {
        res.status(500).json({ success: false, error: error.message } as ApiResponse);
        return;
    }

    let filtered = data || [];
    if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
            (child: any) =>
                child.first_name.toLowerCase().includes(searchLower) ||
                child.last_name.toLowerCase().includes(searchLower) ||
                child.parent?.full_name?.toLowerCase().includes(searchLower)
        );
    }

    res.json({ success: true, data: filtered } as ApiResponse);
});

// ─── Get a single child (admin view) ───────────────────────
/**
 * GET /api/admin/children/:id
 * Full child detail with parent info.
 */
router.get("/children/:id", async (req: Request, res: Response): Promise<void> => {
    if (!isValidUUID(req.params.id)) {
        res.status(400).json({ success: false, error: "Invalid child ID" } as ApiResponse);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("children")
        .select(
            `*,
             parent:profiles!children_parent_id_fkey(id, full_name, email, phone)`
        )
        .eq("id", req.params.id)
        .single();

    if (error || !data) {
        res.status(404).json({ success: false, error: "Child not found" } as ApiResponse);
        return;
    }

    res.json({ success: true, data } as ApiResponse);
});

// ─── Delete a user ─────────────────────────────────────────
/**
 * DELETE /api/admin/users/:id
 * Remove a user entirely (profile + auth record).
 */
router.delete(
    "/users/:id",
    async (req: Request, res: Response): Promise<void> => {
        if (!isValidUUID(req.params.id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" } as ApiResponse);
            return;
        }

        // Prevent admin from deleting themselves
        if (req.params.id === req.userId) {
            res.status(400).json({
                success: false,
                error: "You cannot delete your own account",
            } as ApiResponse);
            return;
        }

        // Delete from auth (cascades to profiles via FK)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id as string);

        if (error) {
            res.status(500).json({ success: false, error: error.message } as ApiResponse);
            return;
        }

        res.json({ success: true, message: "User deleted" } as ApiResponse);
    }
);

export default router;
