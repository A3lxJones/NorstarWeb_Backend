/**
 * Seed script — creates test teams for development.
 * Run with: npx tsx scripts/seed-teams.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../src/config/supabase";

interface TestTeam {
    name: string;
    age_group: string;
    coach_id?: string;
}

const testTeams: TestTeam[] = [
    {
        name: "U10 Beginner",
        age_group: "10",
    },
    {
        name: "U12 Intermediate",
        age_group: "12",
    },
    {
        name: "U14 Advanced",
        age_group: "14",
    },
    {
        name: "U16 Elite",
        age_group: "16",
    },
    {
        name: "U18 Senior",
        age_group: "18",
    },
];

async function seedTeams() {
    console.log("🌱 Seeding teams...");

    try {
        // Insert teams
        const { data: insertedTeams, error: insertError } = await supabaseAdmin
            .from("teams")
            .insert(testTeams)
            .select();

        if (insertError) {
            console.error("❌ Error inserting teams:", insertError);
            return;
        }

        console.log(`✅ Successfully created ${insertedTeams.length} teams`);
        insertedTeams.forEach((team: any) => {
            console.log(`   • ${team.name} (${team.age_group})`);
        });

    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
}

seedTeams();
