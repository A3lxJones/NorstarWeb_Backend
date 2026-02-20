import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { authenticate } from "../middleware/auth";
import { ApiResponse } from "../types";

const router = Router();

router.use(authenticate);

/**
 * GET /api/dashboard
 * Returns role-specific summary data.
 *
 * Parent  → their children, upcoming games for their children's teams, pending registrations
 * Coach   → their teams, all upcoming games, team rosters, pending registrations to approve
 * Admin   → full stats: user counts, team counts, upcoming games, recent reports
 *
 * When an admin sends X-View-As-Role: parent|coach they'll get that role's dashboard,
 * which is great for testing the frontend views.
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    const role = req.userRole;
    const userId = req.userId!;

    try {
        if (role === "parent") {
            // ── Parent dashboard ──────────────────────────────
            const [childrenRes, registrationsRes] = await Promise.all([
                supabaseAdmin
                    .from("children")
                    .select("id, first_name, last_name, date_of_birth, skill_level, position")
                    .eq("parent_id", userId),
                supabaseAdmin
                    .from("team_registrations")
                    .select("id, status, team:teams(id, name), child:children(id, first_name, last_name)")
                    .eq("registered_by", userId)
                    .order("created_at", { ascending: false }),
            ]);

            // Get team IDs the parent's children are approved into
            const approvedTeamIds = (registrationsRes.data || [])
                .filter((r: any) => r.status === "approved")
                .map((r: any) => r.team?.id)
                .filter(Boolean);

            let upcomingGames: any[] = [];
            if (approvedTeamIds.length > 0) {
                const { data } = await supabaseAdmin
                    .from("games")
                    .select("id, game_date, game_time, game_type, location, status, home_team:teams!home_team_id(id, name)")
                    .in("home_team_id", approvedTeamIds)
                    .gte("game_date", new Date().toISOString().split("T")[0])
                    .eq("status", "scheduled")
                    .order("game_date", { ascending: true })
                    .limit(10);
                upcomingGames = data || [];
            }

            res.json({
                success: true,
                data: {
                    role: "parent",
                    children: childrenRes.data || [],
                    registrations: registrationsRes.data || [],
                    upcomingGames,
                },
            } as ApiResponse);

        } else if (role === "coach") {
            // ── Coach dashboard ───────────────────────────────
            const [teamsRes, pendingRegsRes, upcomingGamesRes] = await Promise.all([
                supabaseAdmin
                    .from("teams")
                    .select("id, name, age_group")
                    .eq("coach_id", userId),
                supabaseAdmin
                    .from("team_registrations")
                    .select("id, status, team:teams(id, name, coach_id), child:children(id, first_name, last_name)")
                    .eq("status", "pending"),
                supabaseAdmin
                    .from("games")
                    .select("id, game_date, game_time, game_type, location, status, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name)")
                    .gte("game_date", new Date().toISOString().split("T")[0])
                    .eq("status", "scheduled")
                    .order("game_date", { ascending: true })
                    .limit(20),
            ]);

            // Filter pending registrations to this coach's teams only
            const coachTeamIds = (teamsRes.data || []).map((t: any) => t.id);
            const pendingForCoach = (pendingRegsRes.data || []).filter(
                (r: any) => coachTeamIds.includes(r.team?.id)
            );

            res.json({
                success: true,
                data: {
                    role: "coach",
                    teams: teamsRes.data || [],
                    pendingRegistrations: pendingForCoach,
                    upcomingGames: upcomingGamesRes.data || [],
                },
            } as ApiResponse);

        } else {
            // ── Admin dashboard ───────────────────────────────
            const [usersRes, teamsRes, gamesRes, reportsRes] = await Promise.all([
                supabaseAdmin.from("profiles").select("role"),
                supabaseAdmin.from("teams").select("id"),
                supabaseAdmin
                    .from("games")
                    .select("id, game_date, game_time, game_type, location, status, home_team:teams!home_team_id(id, name)")
                    .gte("game_date", new Date().toISOString().split("T")[0])
                    .order("game_date", { ascending: true })
                    .limit(10),
                supabaseAdmin
                    .from("reports")
                    .select("id, title, report_type, created_at, author:profiles!created_by(full_name)")
                    .order("created_at", { ascending: false })
                    .limit(10),
            ]);

            const users = usersRes.data || [];
            const roleCounts = {
                parents: users.filter((u: any) => u.role === "parent").length,
                coaches: users.filter((u: any) => u.role === "coach").length,
                admins: users.filter((u: any) => u.role === "admin").length,
                total: users.length,
            };

            res.json({
                success: true,
                data: {
                    role: "admin",
                    userCounts: roleCounts,
                    teamCount: (teamsRes.data || []).length,
                    upcomingGames: gamesRes.data || [],
                    recentReports: reportsRes.data || [],
                },
            } as ApiResponse);
        }
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message } as ApiResponse);
    }
});

export default router;
