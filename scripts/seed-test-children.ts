/**
 * Seed script — creates test children for parents.
 * Run with: npx tsx scripts/seed-test-children.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../src/config/supabase";

interface TestChild {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    medical_conditions?: string;
    allergies?: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    skill_level?: "beginner" | "intermediate" | "advanced";
    photo_consent?: boolean;
}

async function seed() {
    console.log("🏒 Seeding Norstar test children...\n");

    // First, find the parent user
    const { data: parentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", "parent@norstar.test")
        .single();

    if (!parentProfile) {
        console.error(
            "✗ Parent user not found. Please run seed-test-users.ts first."
        );
        process.exit(1);
    }

    const parentId = parentProfile.id;
    console.log(`✓ Found parent user: ${parentId}\n`);

    const testChildren: TestChild[] = [
        {
            first_name: "Emma",
            last_name: "Parent",
            date_of_birth: "2015-03-21",
            gender: "female",
            medical_conditions: "None",
            allergies: "Peanut allergy",
            emergency_contact_name: "Jane Parent",
            emergency_contact_phone: "07700100003",
            emergency_contact_relationship: "Grandmother",
            skill_level: "intermediate",
            photo_consent: true,
        },
        {
            first_name: "Oliver",
            last_name: "Parent",
            date_of_birth: "2017-07-15",
            gender: "male",
            medical_conditions: "Asthma",
            allergies: "None",
            emergency_contact_name: "John Parent",
            emergency_contact_phone: "07700100004",
            emergency_contact_relationship: "Uncle",
            skill_level: "beginner",
            photo_consent: false,
        },
        {
            first_name: "Sophia",
            last_name: "Parent",
            date_of_birth: "2016-11-08",
            gender: "female",
            medical_conditions: "None",
            allergies: "Shellfish allergy",
            emergency_contact_name: "Pat Parent",
            emergency_contact_phone: "07700100003",
            emergency_contact_relationship: "Parent",
            skill_level: "advanced",
            photo_consent: true,
        },
    ];

    let successCount = 0;
    for (const child of testChildren) {
        const childData = {
            parent_id: parentId,
            ...child,
        };

        const { data, error } = await supabaseAdmin
            .from("children")
            .insert(childData)
            .select()
            .single();

        if (error) {
            console.log(
                `  ✗  ${child.first_name} ${child.last_name} — ${error.message}`
            );
        } else {
            console.log(
                `  ✓  ${child.first_name} ${child.last_name} created (${child.skill_level})`
            );
            successCount++;
        }
    }

    console.log(
        `\n✅ Done! Created ${successCount} test children for parent@norstar.test`
    );
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
