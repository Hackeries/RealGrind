-- Comprehensive schema for role-based competitive programming platform
-- Supports Student, Organizer, and Admin roles with full feature set

-- Custom contests created by organizers
CREATE TABLE IF NOT EXISTS custom_contests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id INTEGER REFERENCES colleges(id),
  is_college_specific BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'mixed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  problem_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'finished', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems in custom contests
CREATE TABLE IF NOT EXISTS custom_contest_problems (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id TEXT NOT NULL REFERENCES custom_contests(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  problem_index TEXT NOT NULL, -- A, B, C, etc.
  points INTEGER DEFAULT 100,
  time_limit_ms INTEGER DEFAULT 2000,
  memory_limit_kb INTEGER DEFAULT 262144,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, problem_index),
  UNIQUE(contest_id, problem_id)
);

-- Custom contest registrations
CREATE TABLE IF NOT EXISTS custom_contest_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id TEXT NOT NULL REFERENCES custom_contests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'participated', 'no_show')),
  UNIQUE(contest_id, user_id)
);

-- Custom contest submissions
CREATE TABLE IF NOT EXISTS custom_contest_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id TEXT NOT NULL REFERENCES custom_contests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL,
  verdict TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  time_consumed_ms INTEGER,
  memory_consumed_kb INTEGER,
  programming_language TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom contest standings
CREATE TABLE IF NOT EXISTS custom_contest_standings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id TEXT NOT NULL REFERENCES custom_contests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  penalty_time INTEGER DEFAULT 0,
  last_submission_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Organizer permissions and college associations
CREATE TABLE IF NOT EXISTS organizer_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id INTEGER REFERENCES colleges(id),
  can_create_contests BOOLEAN DEFAULT true,
  can_manage_participants BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT true,
  can_moderate_submissions BOOLEAN DEFAULT false,
  approved_by TEXT REFERENCES users(id), -- Admin who approved
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

-- Admin actions and audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'approve_organizer', 'create_contest', 'moderate_user', etc.
  target_type TEXT NOT NULL, -- 'user', 'contest', 'submission', etc.
  target_id TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced leaderboards with multiple categories
CREATE TABLE IF NOT EXISTS leaderboards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('global', 'college', 'state', 'friends', 'custom')),
  scope_id TEXT, -- college_id for college leaderboards, user_id for friends, etc.
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  recent_activity_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, scope_id, user_id)
);

-- User performance analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  problems_attempted INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  rating_change INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  topics_practiced TEXT[], -- Array of problem tags/topics
  difficulty_distribution JSONB, -- {"easy": 5, "medium": 3, "hard": 1}
  language_usage JSONB, -- {"cpp": 8, "python": 2}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Problem recommendations based on user performance
CREATE TABLE IF NOT EXISTS problem_recommendations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('skill_gap', 'practice', 'challenge', 'review')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  tags TEXT[],
  difficulty_rating INTEGER,
  estimated_solve_time INTEGER, -- in minutes
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'attempted', 'solved', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(user_id, problem_id)
);

-- Friend connections for social features
CREATE TABLE IF NOT EXISTS user_friends (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

-- Notification system
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'contest_reminder', 'friend_request', 'achievement', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data for the notification
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- User achievements and badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'first_solve', 'streak_7', 'contest_winner', etc.
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- Additional achievement data
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_contests_created_by ON custom_contests(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_contests_college_id ON custom_contests(college_id);
CREATE INDEX IF NOT EXISTS idx_custom_contests_status ON custom_contests(status);
CREATE INDEX IF NOT EXISTS idx_custom_contests_start_time ON custom_contests(start_time);

CREATE INDEX IF NOT EXISTS idx_custom_contest_problems_contest_id ON custom_contest_problems(contest_id);
CREATE INDEX IF NOT EXISTS idx_custom_contest_registrations_contest_id ON custom_contest_registrations(contest_id);
CREATE INDEX IF NOT EXISTS idx_custom_contest_registrations_user_id ON custom_contest_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_custom_contest_submissions_contest_id ON custom_contest_submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_custom_contest_submissions_user_id ON custom_contest_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_contest_submissions_submitted_at ON custom_contest_submissions(submitted_at);

CREATE INDEX IF NOT EXISTS idx_custom_contest_standings_contest_id ON custom_contest_standings(contest_id);
CREATE INDEX IF NOT EXISTS idx_custom_contest_standings_rank ON custom_contest_standings(contest_id, rank);

CREATE INDEX IF NOT EXISTS idx_organizer_permissions_user_id ON organizer_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_permissions_college_id ON organizer_permissions(college_id);
CREATE INDEX IF NOT EXISTS idx_organizer_permissions_status ON organizer_permissions(status);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type_scope ON leaderboards(type, scope_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(type, scope_id, rank);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_problem_recommendations_user_id ON problem_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_status ON problem_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_priority ON problem_recommendations(user_id, priority DESC);

CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);
