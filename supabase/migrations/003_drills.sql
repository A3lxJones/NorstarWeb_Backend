-- ============================================================
-- Drills — Coaching resources for inline hockey training
-- ============================================================

-- ─── Drills ────────────────────────────────────────────────
CREATE TABLE drills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skating', 'stick_control', 'shooting', 'passing', 'conditioning', 'teamwork')),
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  duration_minutes INTEGER,
  equipment TEXT,
  max_players INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drills_category ON drills(category);
CREATE INDEX idx_drills_skill_level ON drills(skill_level);
CREATE INDEX idx_drills_difficulty ON drills(difficulty);

-- ─── Row Level Security ────────────────────────────────────
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

-- Everyone can view drills (coaches and admins manage them)
CREATE POLICY "Everyone can view drills"
  ON drills FOR SELECT
  USING (true);

-- Only admins can insert/update/delete drills
CREATE POLICY "Admins can manage drills"
  ON drills FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
