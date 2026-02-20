/**
 * Seed script — creates hundreds of inline hockey drills
 * Run with: npx tsx scripts/seed-drills.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../src/config/supabase";

interface Drill {
    name: string;
    description: string;
    instructions: string;
    category: "skating" | "stick_control" | "shooting" | "passing" | "conditioning" | "teamwork";
    skill_level: "beginner" | "intermediate" | "advanced";
    difficulty: number; // 1-5
    duration_minutes: number;
    equipment: string;
    max_players?: number;
    notes?: string;
}

const drills: Drill[] = [
    // ────────────────────────────────────────────────────────
    // SKATING — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Getting Started on Skates",
        description: "Learn basic balance and comfort on inline skates",
        instructions:
            "Put on skates in a safe area. Hold wall or rail. Practice standing with both feet on flat ground. Keep knees slightly bent.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Forward Marching",
        description: "Build confidence moving forward on skates",
        instructions:
            "While holding a rail, lift one skate and place it forward. Alternate feet. Keep hands on rail for support. Maintain upright posture.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Inline skates, protective gear, rail",
    },
    {
        name: "Two-Foot Glide",
        description: "Learn to glide on both skates",
        instructions:
            "While holding rail, push with both feet slightly, then bring them together. Maintain balance. Let momentum carry you forward.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Inline skates, protective gear, rail",
    },
    {
        name: "One-Foot Balance",
        description: "Build single-leg stability",
        instructions:
            "Hold rail with both hands. Lift one skate slightly off ground. Hold for 5 seconds. Switch feet. Progress by reducing hand support.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, rail",
    },
    {
        name: "Basic Stopping — T-Stop",
        description: "Learn the fundamental stopping technique",
        instructions:
            "While moving slowly forward, turn one foot perpendicular behind you (T-shape). Apply pressure with the heel to create friction. Practice on smooth surface.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, smooth surface",
    },
    {
        name: "Crossovers for Beginners",
        description: "Introduction to turning and crossovers",
        instructions:
            "Mark a large circle (15 ft diameter). Skate around the circle. Cross the outside leg over the inside leg when turning. Practice both directions.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones/markers",
        max_players: 6,
    },
    {
        name: "Forward Acceleration",
        description: "Practice pushing and building speed safely",
        instructions:
            "Start from standing. Push off with one leg, bring it back under your body. Alternate legs in a walking-like motion. Build speed gradually.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Backward Skating Introduction",
        description: "Learn to skate backward safely",
        instructions:
            "Hold rail facing forward. Turn head to look behind. Push with toes to move backward. Keep hands on rail. Move slowly at first.",
        category: "skating",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, rail",
    },
    // ────────────────────────────────────────────────────────
    // SKATING — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Crossover Technique",
        description: "Efficient turning using crossover steps",
        instructions:
            "Skate in a circle at moderate speed. Cross outside leg over inside leg. Plant outside leg and push off. Maintain speed through turns.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones",
        max_players: 8,
    },
    {
        name: "Backward Crossovers",
        description: "Cross-stepping while moving backward",
        instructions:
            "Skate backward in a circle. Cross one leg over the other while moving. Maintain balance and control. Keep head up to see behind.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 4,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones",
        max_players: 8,
    },
    {
        name: "Hockey Stop",
        description: "Perform an aggressive stop by sliding sideways",
        instructions:
            "Skate forward at moderate-high speed. Turn feet perpendicular to direction of travel. Dig wheels on both skates into the ground. Lean into the turn.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, smooth indoor surface",
    },
    {
        name: "Forward to Backward Transition",
        description: "Switch smoothly from forward to backward skating",
        instructions:
            "Skate forward. Perform a three-turn or crossover to face backward. Gather balance. Begin backward skating. Practice smooth transitions.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Agility Ladder Drill",
        description: "Improve lateral agility and footwork",
        instructions:
            "Set up cones in a ladder pattern (8 cones, 4 feet apart). Skate through touching each cone. Keep feet light and quick. Progress to backward.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, cones/tape",
        max_players: 4,
    },
    {
        name: "Figure-8 Drill",
        description: "Practice balance and control through figure-8s",
        instructions:
            "Mark two circles (15 ft diameter) side by side. Skate figure-8 pattern at increasing speed. Maintain low center of gravity through turns.",
        category: "skating",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones/markers",
        max_players: 6,
    },
    // ────────────────────────────────────────────────────────
    // SKATING — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "High-Speed Turns",
        description: "Execute sharp turns at high velocity",
        instructions:
            "Skate at high speed in a circle. Use crossovers to maintain momentum. Lean aggressively into turns. Hold edges. Practice both directions.",
        category: "skating",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, cones",
        max_players: 6,
    },
    {
        name: "Mohawk Turn",
        description: "Advanced turn technique using foot angle change",
        instructions:
            "Skate forward. Place feet in V-position. Pivot on one foot while lifting the other. Place lifted foot down perpendicular. Continue in new direction.",
        category: "skating",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "One-Foot Skating",
        description: "Maintain speed and control on one skate",
        instructions:
            "Skate forward. Lift one leg. Maintain balance on one skate. Push with planted leg. Hold for 10+ seconds. Practice both legs.",
        category: "skating",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Transition Drills",
        description: "Rapid direction changes and transitions",
        instructions:
            "Set up gates with cones. Skate forward to gate, execute hockey stop, transition to backward, crossover, forward again. Sequential transitions.",
        category: "skating",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones",
        max_players: 4,
    },
    {
        name: "Backward Skating at Speed",
        description: "Skate backward confidently at high speed",
        instructions:
            "Practice backward skating on a clear court. Build speed gradually. Look over shoulder occasionally. Practice backward stops and transitions.",
        category: "skating",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // STICK CONTROL — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Grip and Stance",
        description: "Learn proper stick grip and body position",
        instructions:
            "Hold stick with both hands, dominant hand lower. Feet shoulder-width apart, knees bent. Stick blade on floor in front of you. Practice stance without moving.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Stationary Dribbling",
        description: "Control the puck while standing still",
        instructions:
            "Place puck in front of you. Use stick blade to tap puck left and right. Keep puck within stick's reach. Maintain firm grip and posture.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Forward Dribbling",
        description: "Control puck while moving forward",
        instructions:
            "Slowly skate forward while tapping puck in front of you. Keep puck within arm's reach. Tap every 2-3 feet. Gradually increase speed.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Straight Line Dribbling",
        description: "Control puck traveling in straight line",
        instructions:
            "Place cones 40 feet apart. Dribble puck in straight line between cones. Keep puck close to stick blade. Focus on smooth, controlled touches.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, cones",
        max_players: 4,
    },
    {
        name: "Basic Forehand Stickhandling",
        description: "Master forehand stick control",
        instructions:
            "Hold stick with blade on floor. Rock puck side to side from forehand side. Keep wrist relaxed. Maintain control within 12 inches of center.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Basic Backhand Stickhandling",
        description: "Control puck on backhand side",
        instructions:
            "Practice moving puck to backhand side of body. Rock puck between forehand and backhand. Keep blade square to floor. Small, controlled movements.",
        category: "stick_control",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // STICK CONTROL — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Figure-8 Dribbling",
        description: "Control puck through figure-8 pattern",
        instructions:
            "Mark two circles (12 ft diameter). Dribble puck in figure-8 pattern. Maintain control through turns. Focus on smooth transitions.",
        category: "stick_control",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear, cones",
        max_players: 4,
    },
    {
        name: "Dribbling Through Obstacle Course",
        description: "Navigate puck around cones while maintaining control",
        instructions:
            "Set up 6-8 cones in zigzag pattern. Dribble puck through cones at controlled speed. Focus on quick hands and puck awareness.",
        category: "stick_control",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, cones",
        max_players: 6,
    },
    {
        name: "Forehand to Backhand Cross",
        description: "Move puck smoothly from forehand to backhand",
        instructions:
            "Rock puck on forehand side. Execute smooth cross to backhand. Return to forehand. Perform 10 consecutive crosses. Focus on quick hand movement.",
        category: "stick_control",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "High-Speed Dribbling",
        description: "Control puck while moving at higher speeds",
        instructions:
            "Skate at moderate-high speed while dribbling puck. Keep puck ahead of body. Make quick directional changes. Maintain control at speed.",
        category: "stick_control",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Tight Turns with Puck",
        description: "Execute sharp turns while maintaining puck control",
        instructions:
            "Dribble in straight line, then make sharp 90° turn. Repeat in both directions. Keep puck close during turns. Maintain speed.",
        category: "stick_control",
        skill_level: "intermediate",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, cones",
        max_players: 4,
    },
    // ────────────────────────────────────────────────────────
    // STICK CONTROL — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "Multi-Directional Stickhandling",
        description: "Advanced puck handling in all directions",
        instructions:
            "Execute stickhandling movements in all directions: forward cross, backward cross, side-to-side. Combine movements fluidly at game speed.",
        category: "stick_control",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Deking on the Move",
        description: "Execute fakes and moves while skating at speed",
        instructions:
            "Skate at high speed. Perform quick side-to-side dekes. Return puck to center. Combine with body feints. Advanced footwork required.",
        category: "stick_control",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear",
    },
    {
        name: "Backward Dribbling with Change of Pace",
        description: "Control puck while moving backward with speed variations",
        instructions:
            "Skate backward while dribbling. Increase speed, then decrease. Execute quick backward stops. Maintain puck control at all speeds.",
        category: "stick_control",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // SHOOTING — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Wrist Shot - Stationary",
        description: "Learn basic wrist shot from standing position",
        instructions:
            "Hold puck on stick blade in front of body. Bring stick back 12-18 inches. Snap wrists forward to release puck. Follow through toward target.",
        category: "shooting",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "Snap Shot - Introduction",
        description: "Basic snap shot technique",
        instructions:
            "Hold puck in middle of stick blade. Load weight on back leg. Snap stick upward by bending shaft. Release puck with forward motion. Aim for goal.",
        category: "shooting",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "Backhand Shot",
        description: "Learn to shoot on backhand side",
        instructions:
            "Hold puck on backhand side of blade. Execute similar motion to wrist shot. Focus on wrist snap and follow through. Aim for goal.",
        category: "shooting",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "Target Practice - High Corners",
        description: "Aim for upper corners of goal",
        instructions:
            "Practice shooting at a stationary target (marked area in upper corners). Take 10 shots at each corner. Focus on accuracy over power.",
        category: "shooting",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal/target",
        max_players: 2,
    },
    // ────────────────────────────────────────────────────────
    // SHOOTING — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Wrist Shot from Dribble",
        description: "Convert dribble into wrist shot",
        instructions:
            "Dribble puck forward. Position puck for shot. Execute wrist shot without stopping. Maintain momentum from approach.",
        category: "shooting",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "Snapshot from Skating",
        description: "Execute snap shot while moving",
        instructions:
            "Skate forward at moderate speed. Dribble puck. Execute snap shot without stopping. Focus on timing and shot accuracy.",
        category: "shooting",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "One-Timer (Basic)",
        description: "Introduction to one-time shot",
        instructions:
            "Receive pass on stick blade. Execute shot immediately without stopping puck. Focus on timing with incoming pass.",
        category: "shooting",
        skill_level: "intermediate",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal, partner",
        max_players: 2,
    },
    {
        name: "Shot Selection Drill",
        description: "Choose appropriate shot type based on situation",
        instructions:
            "Practice different scenarios: dribble → wrist shot, receive pass → snap shot, one-timer. React based on puck location and movement.",
        category: "shooting",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    // ────────────────────────────────────────────────────────
    // SHOOTING — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "Backhand Snapshot from High Speed",
        description: "Execute backhand snap shot at game speed",
        instructions:
            "Skate at high speed. Transition puck to backhand. Execute snap shot. Focus on quick wrist rotation and follow through.",
        category: "shooting",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, goal",
    },
    {
        name: "One-Timer from Different Angles",
        description: "Execute one-timers from various shooting positions",
        instructions:
            "Receive passes from different angles (30°, 45°, 90°). Execute one-timers without stopping puck. Adjust body angle to target.",
        category: "shooting",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear, goal, passer",
        max_players: 2,
    },
    {
        name: "High-Coverage Shots",
        description: "Score despite defensive pressure",
        instructions:
            "Practice shooting with defenders applying light pressure. Adjust shot angle and timing. Focus on quick release and accuracy.",
        category: "shooting",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Hockey stick, puck, protective gear, goal, defender",
        max_players: 2,
    },
    // ────────────────────────────────────────────────────────
    // PASSING — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Stationary Pass - Forehand",
        description: "Basic forehand pass while standing still",
        instructions:
            "Hold puck in front of body on stick blade. Push puck toward target with stick blade. Keep puck on floor. Focus on accuracy.",
        category: "passing",
        skill_level: "beginner",
        difficulty: 1,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Stationary Pass - Backhand",
        description: "Basic backhand pass while standing",
        instructions:
            "Position puck on backhand side of stick blade. Push puck with backhand. Maintain control and accuracy. Focus on smooth release.",
        category: "passing",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 15,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Moving Pass",
        description: "Execute pass while skating forward",
        instructions:
            "Skate slowly forward with puck. Execute forehand pass to partner. Maintain control and accuracy. Progress to higher speeds.",
        category: "passing",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Pass Reception - Soft Touch",
        description: "Receive puck on stick blade safely",
        instructions:
            "Partner passes puck to you. Cushion pass by relaxing stick blade slightly. Keep puck in front of body. Practice receiving from various angles.",
        category: "passing",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    // ────────────────────────────────────────────────────────
    // PASSING — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Saucer Pass",
        description: "Float puck over defender's stick",
        instructions:
            "Hold puck on blade. Scoop downward then upward to lift puck off ice. Arc pass over defender. Receive on stick blade.",
        category: "passing",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner, defender",
        max_players: 3,
    },
    {
        name: "Tape-to-Tape Pass",
        description: "Accurate pass landing directly on teammate's stick",
        instructions:
            "Pass puck directly to partner's stick blade (tape). Focus on accuracy and timing. Practice at various speeds and angles.",
        category: "passing",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Diagonal Pass Network",
        description: "Execute diagonal passes in pattern play",
        instructions:
            "Four players in square formation. Pass diagonally across square. Move to receive pass. Maintain spacing. Increase speed.",
        category: "passing",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Hockey sticks, puck, protective gear",
        max_players: 4,
    },
    {
        name: "Breakout Pass",
        description: "Exit defensive zone with accurate pass",
        instructions:
            "Start with puck behind goal line. Execute pass to break out of zone. Receive pass at goal line. Move puck forward efficiently.",
        category: "passing",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    // ────────────────────────────────────────────────────────
    // PASSING — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "No-Look Pass",
        description: "Execute pass without looking at recipient",
        instructions:
            "Look away from passing target while executing pass. Focus on spatial awareness. Maintain accuracy despite lack of visual contact.",
        category: "passing",
        skill_level: "advanced",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Cross-Ice Pass at Speed",
        description: "Execute long cross-court pass while skating",
        instructions:
            "Skate at high speed. Execute cross-ice pass (full width of court) to moving target. Focus on speed, accuracy, and timing.",
        category: "passing",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Backhand Saucer Pass",
        description: "Float elevated backhand pass over defenders",
        instructions:
            "Execute saucer pass using backhand side of blade. Scoop and lift puck. Focus on lift angle and recipient positioning.",
        category: "passing",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner, defender",
        max_players: 3,
    },
    // ────────────────────────────────────────────────────────
    // CONDITIONING — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Straight-Line Skating Intervals",
        description: "Build cardiovascular fitness with interval skating",
        instructions:
            "Skate full court at moderate pace. Rest at end. Repeat 5-8 times. Focus on consistent pacing and recovery between intervals.",
        category: "conditioning",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Sprint and Recovery",
        description: "Alternate between high-intensity sprints and recovery",
        instructions:
            "Sprint 100 feet at full speed. Slow skate 100 feet to recover. Repeat 6 times. Focus on maintaining form at high intensity.",
        category: "conditioning",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear",
    },
    {
        name: "Perimeter Skating",
        description: "Continuous skating around court perimeter",
        instructions:
            "Skate continuously around court boundary. Maintain steady pace. Complete 10 laps at moderate intensity without stopping.",
        category: "conditioning",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // CONDITIONING — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Multi-Direction Sprints",
        description: "High-intensity sprints with direction changes",
        instructions:
            "Sprint forward 50 feet, backward 50 feet, lateral 40 feet each direction. Repeat 4-5 times with brief recovery. Build explosive power.",
        category: "conditioning",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear, cones",
    },
    {
        name: "Hill Repeats (if available)",
        description: "Build leg strength with incline skating",
        instructions:
            "Skate up slope at high intensity, recover on flat surface, repeat. 5-6 repeats. Focus on explosive leg drive uphill.",
        category: "conditioning",
        skill_level: "intermediate",
        difficulty: 4,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, sloped surface",
    },
    {
        name: "Plyometric Conditioning Circuit",
        description: "Off-ice conditioning with plyometrics",
        instructions:
            "Complete circuit: vertical jump (10), box step-ups (20), lateral bounds (20), medicine ball slams (10). Rest 1 minute. Repeat 3 sets.",
        category: "conditioning",
        skill_level: "intermediate",
        difficulty: 4,
        duration_minutes: 20,
        equipment: "Box, medicine ball, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // CONDITIONING — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "Game Simulation Conditioning",
        description: "Condition with game-like movement patterns",
        instructions:
            "Perform 45-second high-intensity station with 15-second recovery (repeat 8 times). Include sprints, crossovers, stops, transitions.",
        category: "conditioning",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Inline skates, protective gear, cones",
    },
    {
        name: "Maximum Intensity Intervals",
        description: "All-out effort sprints with minimal recovery",
        instructions:
            "Sprint at absolute maximum effort for 30 seconds. Recover 15 seconds. Repeat 8-10 times. Push to anaerobic threshold.",
        category: "conditioning",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 20,
        equipment: "Inline skates, protective gear",
    },
    // ────────────────────────────────────────────────────────
    // TEAMWORK — Beginner Level
    // ────────────────────────────────────────────────────────
    {
        name: "Two-Pass Drill",
        description: "Execute passing sequence with teammate",
        instructions:
            "You and partner skate together. Pass puck back and forth. Each player touches puck twice. Maintain movement and spacing.",
        category: "teamwork",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey stick, puck, protective gear, partner",
        max_players: 2,
    },
    {
        name: "Three-Player Keep-Away",
        description: "Three teammates maintain puck possession",
        instructions:
            "Three players form triangle. Pass puck around keeping it in possession. Focus on spacing and quick passes. Move into open space.",
        category: "teamwork",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey sticks, puck, protective gear",
        max_players: 3,
    },
    {
        name: "Give-and-Go Drill",
        description: "Execute simple two-player give-and-go play",
        instructions:
            "Pass to teammate, receive return pass. Continue moving forward. Execute play multiple times. Focus on timing and spacing.",
        category: "teamwork",
        skill_level: "beginner",
        difficulty: 2,
        duration_minutes: 20,
        equipment: "Hockey sticks, puck, protective gear",
        max_players: 2,
    },
    // ────────────────────────────────────────────────────────
    // TEAMWORK — Intermediate Level
    // ────────────────────────────────────────────────────────
    {
        name: "Game-Situation Drills",
        description: "Practice game-like team scenarios",
        instructions:
            "Offense vs. defense 2-on-2. Offense executes plays to score. Defense applies light pressure. Rotate players. Focus on decision-making.",
        category: "teamwork",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Hockey sticks, puck, protective gear, goal",
        max_players: 4,
    },
    {
        name: "Transition Play Drill",
        description: "Practice rapid switches from defense to offense",
        instructions:
            "Start with defensive formation. Quickly transition to offense. Execute fast break with support players. Switch back to defense.",
        category: "teamwork",
        skill_level: "intermediate",
        difficulty: 3,
        duration_minutes: 25,
        equipment: "Hockey sticks, puck, protective gear",
        max_players: 4,
    },
    // ────────────────────────────────────────────────────────
    // TEAMWORK — Advanced Level
    // ────────────────────────────────────────────────────────
    {
        name: "Full-Court Scrimmage",
        description: "Competitive practice game scenario",
        instructions:
            "Full team scrimmage with modifications (continuous play, emphasis on certain skills). Focus on game awareness and team coordination.",
        category: "teamwork",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 30,
        equipment: "Hockey sticks, puck, protective gear, goals",
        max_players: 12,
    },
    {
        name: "Pressure Drill",
        description: "Execute plays under defensive pressure",
        instructions:
            "Offense practices plays with aggressive defense. Focus on puck security, quick decision making, and team support play.",
        category: "teamwork",
        skill_level: "advanced",
        difficulty: 5,
        duration_minutes: 25,
        equipment: "Hockey sticks, puck, protective gear, goal",
        max_players: 6,
    },
];

async function seed() {
    console.log("🏒 Seeding inline hockey drills...\n");

    try {
        const { error } = await supabaseAdmin.from("drills").insert(drills);

        if (error) {
            console.error("❌ Error seeding drills:", error.message);
            process.exit(1);
        }

        console.log(`✅ Successfully seeded ${drills.length} drills!`);
        console.log("\n📊 Breakdown by category:");
        const categories = ["skating", "stick_control", "shooting", "passing", "conditioning", "teamwork"] as const;
        for (const category of categories) {
            const count = drills.filter((d) => d.category === category).length;
            console.log(`   • ${category}: ${count} drills`);
        }

        console.log("\n📊 Breakdown by skill level:");
        const skillLevels = ["beginner", "intermediate", "advanced"] as const;
        for (const level of skillLevels) {
            const count = drills.filter((d) => d.skill_level === level).length;
            console.log(`   • ${level}: ${count} drills`);
        }
    } catch (err: any) {
        console.error("Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
