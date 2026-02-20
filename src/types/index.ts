// ─── User roles ─────────────────────────────────────────────
export type UserRole = "parent" | "coach" | "admin";

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

// ─── Children ───────────────────────────────────────────────
export interface Child {
    id: string;
    parent_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    medical_conditions: string | null;
    allergies: string | null;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    photo_consent: boolean;
    skill_level: "beginner" | "intermediate" | "advanced" | null;
    position: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateChildDTO {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    medical_conditions?: string;
    allergies?: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    photo_consent: boolean;
    skill_level?: "beginner" | "intermediate" | "advanced";
    position?: string;
}

// ─── Teams ──────────────────────────────────────────────────
export type AgeGroup = "learn_to_play" | "u13" | "u15";
export const VALID_AGE_GROUPS: AgeGroup[] = ["learn_to_play", "u13", "u15"];

export interface Team {
    id: string;
    name: string;
    age_group: AgeGroup;
    coach_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface TeamRegistration {
    id: string;
    team_id: string;
    child_id: string;
    registered_by: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

// ─── Games / Matches ────────────────────────────────────────
export interface Game {
    id: string;
    home_team_id: string;
    away_team_id: string | null;
    opponent_name: string | null;
    location: string;
    game_date: string;
    game_time: string;
    game_type: "league" | "friendly" | "tournament" | "training";
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    home_score: number | null;
    away_score: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateGameDTO {
    home_team_id: string;
    away_team_id?: string;
    opponent_name?: string;
    location: string;
    game_date: string;
    game_time: string;
    game_type: "league" | "friendly" | "tournament" | "training";
    notes?: string;
}

// ─── Availability ───────────────────────────────────────────
export type AvailabilityType = "match" | "training";
export type AvailabilityStatus = "available" | "unavailable" | "tentative";

export interface Availability {
    id: string;
    child_id: string;
    game_id: string | null;
    availability_type: AvailabilityType;
    event_date: string;
    status: AvailabilityStatus;
    reason: string | null;
    submitted_by: string;
    created_at: string;
    updated_at: string;
}

export interface SubmitAvailabilityDTO {
    child_id: string;
    game_id?: string;
    availability_type: AvailabilityType;
    event_date: string;
    status: AvailabilityStatus;
    reason?: string;
}

// ─── Reports (admin) ────────────────────────────────────────
export interface Report {
    id: string;
    title: string;
    content: string;
    report_type: "incident" | "feedback" | "general";
    created_by: string;
    related_child_id: string | null;
    related_game_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateReportDTO {
    title: string;
    content: string;
    report_type: "incident" | "feedback" | "general";
    related_child_id?: string;
    related_game_id?: string;
}

// ─── Drills (coaching resources) ────────────────────────────
export type DrillCategory = "skating" | "stick_control" | "shooting" | "passing" | "conditioning" | "teamwork";
export type DrillSkillLevel = "beginner" | "intermediate" | "advanced";

export interface Drill {
    id: string;
    name: string;
    description: string;
    instructions: string;
    category: DrillCategory;
    skill_level: DrillSkillLevel;
    difficulty: number; // 1-5
    duration_minutes: number | null;
    equipment: string | null;
    max_players: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateDrillDTO {
    name: string;
    description: string;
    instructions: string;
    category: DrillCategory;
    skill_level: DrillSkillLevel;
    difficulty: number;
    duration_minutes?: number;
    equipment?: string;
    max_players?: number;
    notes?: string;
}

// ─── API response helpers ───────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
