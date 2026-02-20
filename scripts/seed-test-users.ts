/**
 * Seed script — creates test users for each role.
 * Run with: npx tsx scripts/seed-test-users.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../src/config/supabase";

interface TestUser {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: "admin" | "coach" | "parent";
}

const testUsers: TestUser[] = [
    {
        email: "admin@norstar.test",
        password: "Admin123!",
        full_name: "Alex Admin",
        phone: "07700100001",
        role: "admin",
    },
    {
        email: "coach@norstar.test",
        password: "Coach123!",
        full_name: "Chris Coach",
        phone: "07700100002",
        role: "coach",
    },
    {
        email: "parent@norstar.test",
        password: "Parent123!",
        full_name: "Pat Parent",
        phone: "07700100003",
        role: "parent",
    },
];

async function seed() {
    console.log("🏒 Seeding Norstar test users...\n");

    for (const user of testUsers) {
        // Use the admin API so we can skip email confirmation
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // auto-confirm so we can log in immediately
            user_metadata: {
                full_name: user.full_name,
                phone: user.phone,
                role: user.role,
            },
        });

        if (error) {
            // If user already exists, just report it and move on
            if (error.message.includes("already been registered") || error.status === 422) {
                console.log(`  ⚠  ${user.role.toUpperCase()} (${user.email}) — already exists, skipping`);
            } else {
                console.error(`  ✗  ${user.role.toUpperCase()} (${user.email}) — ${error.message}`);
            }
            continue;
        }

        // The DB trigger should create the profile, but belt-and-braces upsert
        if (data.user) {
            await supabaseAdmin.from("profiles").upsert({
                id: data.user.id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                role: user.role,
            });
        }

        console.log(`  ✓  ${user.role.toUpperCase()} created — ${user.email} / ${user.password}`);
    }

    console.log("\n✅ Done! Test credentials:");
    console.log("┌────────────┬──────────────────────┬────────────┐");
    console.log("│ Role       │ Email                │ Password   │");
    console.log("├────────────┼──────────────────────┼────────────┤");
    for (const u of testUsers) {
        console.log(`│ ${u.role.padEnd(10)} │ ${u.email.padEnd(20)} │ ${u.password.padEnd(10)} │`);
    }
    console.log("└────────────┴──────────────────────┴────────────┘");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
