import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { UserRole } from "../types";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: UserRole;
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
    const { data: profile, error: profileError } = await supabase
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

    next();
}

/**
 * Middleware factory: Restrict route to specific roles.
 * Usage: authorize("admin", "coach")
 */
export function authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to access this resource",
            });
            return;
        }
        next();
    };
}
