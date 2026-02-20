import { Request, Response, NextFunction } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { UserRole } from "../types";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: UserRole;        // effective role (may be overridden by impersonation)
            userRealRole?: UserRole;     // actual role from the database (never changes)
            userEmail?: string;
        }
    }
}

/**
 * Middleware: Verify Supabase JWT and attach user info to request.
 * Expects header: Authorization: Bearer <supabase-access-token>
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Missing or invalid authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        res.status(401).json({ success: false, error: "Invalid or expired token" });
        return;
    }

    // Fetch the user's role from the profiles table
    // Use supabaseAdmin to bypass RLS — the JWT is already validated above
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        res.status(403).json({ success: false, error: "User profile not found" });
        return;
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = profile.role as UserRole;
    req.userRealRole = profile.role as UserRole;

    // ── Admin impersonation ─────────────────────────────────
    // If the user is an admin and sends X-View-As-Role header,
    // temporarily override the effective role so they can test
    // the parent or coach experience. The real role is still "admin"
    // and is preserved in req.userRealRole for admin-only checks.
    const viewAsRole = req.headers["x-view-as-role"] as string | undefined;
    if (
        req.userRealRole === "admin" &&
        viewAsRole &&
        ["parent", "coach"].includes(viewAsRole)
    ) {
        req.userRole = viewAsRole as UserRole;
    }

    next();
}

/**
 * Middleware factory: Restrict route to specific roles.
 * Usage: authorize("admin", "coach")
 *
 * An admin is ALWAYS allowed through, even when impersonating
 * another role — so they're never locked out of admin routes.
 */
export function authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const effectiveRole = req.userRole;
        const realRole = req.userRealRole;

        // Admin always passes authorization
        if (realRole === "admin") {
            next();
            return;
        }

        if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to access this resource",
            });
            return;
        }
        next();
    };
}
