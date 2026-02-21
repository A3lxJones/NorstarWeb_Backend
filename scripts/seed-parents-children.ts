/**
 * Seed script — creates 3 test parents with children.
 * One parent gets 2 children, the other two get 1 each.
 * Run with: npx tsx scripts/seed-parents-children.ts
 *
 * Prerequisites: Run seed-test-users.ts first (or at least have profiles table ready).
 */
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../src/config/supabase";

interface TestParent {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    children: TestChild[];
}

interface TestChild {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    skill_level: "beginner" | "intermediate" | "advanced";
    position: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    medical_conditions?: string;
    allergies?: string;
    photo_consent: boolean;
}

const testParents: TestParent[] = [
    {
        email: "sarah.jones@norstar.test",
        password: "Parent123!",
        full_name: "Sarah Jones",
        phone: "07700200001",
        children: [
            {
                first_name: "Oliver",
                last_name: "Jones",
                date_of_birth: "2013-04-15",
                gender: "male",
                skill_level: "intermediate",
                position: "forward",
                emergency_contact_name: "Sarah Jones",
                emergency_contact_phone: "07700200001",
                emergency_contact_relationship: "Mother",
                medical_conditions: "Mild asthma",
                allergies: null as unknown as string,
                photo_consent: true,
            },
            {
                first_name: "Emily",
                last_name: "Jones",
                date_of_birth: "2015-09-22",
                gender: "female",
                skill_level: "beginner",
                position: "defender",
                emergency_contact_name: "Sarah Jones",
                emergency_contact_phone: "07700200001",
                emergency_contact_relationship: "Mother",
                photo_consent: true,
            },
        ],
    },
    {
        email: "mark.thompson@norstar.test",
        password: "Parent123!",
        full_name: "Mark Thompson",
        phone: "07700200002",
        children: [
            {
                first_name: "Jake",
                last_name: "Thompson",
                date_of_birth: "2012-01-10",
                gender: "male",
                skill_level: "advanced",
                position: "goalie",
                emergency_contact_name: "Mark Thompson",
                emergency_contact_phone: "07700200002",
                emergency_contact_relationship: "Father",
                allergies: "Peanuts",
                photo_consent: true,
            },
        ],
    },
    {
        email: "lisa.patel@norstar.test",
        password: "Parent123!",
        full_name: "Lisa Patel",
        phone: "07700200003",
        children: [
            {
                first_name: "Aiden",
                last_name: "Patel",
                date_of_birth: "2014-07-03",
                gender: "male",
                skill_level: "intermediate",
                position: "midfielder",
                emergency_contact_name: "Lisa Patel",
                emergency_contact_phone: "07700200003",
                emergency_contact_relationship: "Mother",
                medical_conditions: "Eczema",
                photo_consent: false,
            },
        ],
    },
];

async function seed() {
    console.log("🏒 Seeding test parents & children...\n");

    for (const parent of testParents) {
        // 1. Create the auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: parent.email,
            password: parent.password,
            email_confirm: true,
            user_metadata: {
                full_name: parent.full_name,
                phone: parent.phone,
                role: "parent",
            },
        });

        let parentId: string;

        if (authError) {
            if (authError.message.includes("already been registered") || authError.status === 422) {
                console.log(`  ⚠  Parent ${parent.full_name} (${parent.email}) — already exists, looking up ID`);
                // Look up existing profile
                const { data: existing } = await supabaseAdmin
                    .from("profiles")
                    .select("id")
                    .eq("email", parent.email)
                    .single();

                if (!existing) {
                    console.error(`  ✗  Could not find profile for ${parent.email}, skipping`);
                    continue;
                }
                parentId = existing.id;
            } else {
                console.error(`  ✗  Failed to create ${parent.email}: ${authError.message}`);
                continue;
            }
        } else {
            parentId = authData.user.id;

            // Belt-and-braces: upsert profile
            await supabaseAdmin.from("profiles").upsert({
                id: parentId,
                email: parent.email,
                full_name: parent.full_name,
                phone: parent.phone,
                role: "parent",
            });

            console.log(`  ✓  Parent created — ${parent.full_name} (${parent.email})`);
        }

        // 2. Create children for this parent
        for (const child of parent.children) {
            // Check if child already exists (by name + parent)
            const { data: existingChild } = await supabaseAdmin
                .from("children")
                .select("id")
                .eq("parent_id", parentId)
                .eq("first_name", child.first_name)
                .eq("last_name", child.last_name)
                .maybeSingle();

            if (existingChild) {
                console.log(`    ⚠  Child ${child.first_name} ${child.last_name} — already exists, skipping`);
                continue;
            }

            const { error: childError } = await supabaseAdmin.from("children").insert({
                parent_id: parentId,
                first_name: child.first_name,
                last_name: child.last_name,
                date_of_birth: child.date_of_birth,
                gender: child.gender,
                skill_level: child.skill_level,
                position: child.position,
                emergency_contact_name: child.emergency_contact_name,
                emergency_contact_phone: child.emergency_contact_phone,
                emergency_contact_relationship: child.emergency_contact_relationship,
                medical_conditions: child.medical_conditions || null,
                allergies: child.allergies || null,
                photo_consent: child.photo_consent,
            });

            if (childError) {
                console.error(`    ✗  Child ${child.first_name} ${child.last_name} — ${childError.message}`);
            } else {
                console.log(`    ✓  Child added — ${child.first_name} ${child.last_name} (DOB: ${child.date_of_birth})`);
            }
        }
    }

    console.log("\n✅ Done! Test parent credentials:");
    console.log("┌────────────────────────┬──────────────────────────────────┬────────────┬──────────┐");
    console.log("│ Name                   │ Email                            │ Password   │ Children │");
    console.log("├────────────────────────┼──────────────────────────────────┼────────────┼──────────┤");
    for (const p of testParents) {
        console.log(`│ ${p.full_name.padEnd(22)} │ ${p.email.padEnd(32)} │ ${p.password.padEnd(10)} │ ${String(p.children.length).padEnd(8)} │`);
    }
    console.log("└────────────────────────┴──────────────────────────────────┴────────────┴──────────┘");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
