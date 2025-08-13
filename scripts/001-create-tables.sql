-- Create tables for RealGrind competitive programming platform

-- Users table (extends existing users_sync)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  codeforces_handle TEXT UNIQUE,
  college TEXT,
  graduation_year INTEGER,
  current_rating INTEGER DEFAULT 0,
  max_rating INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  contest_id TEXT NOT NULL,
  index TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  rating INTEGER,
  tags TEXT[],
  solved_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User problem submissions
CREATE TABLE IF NOT EXISTS user_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL,
  programming_language TEXT,
  time_consumed_millis INTEGER,
  memory_consumed_bytes BIGINT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id, submitted_at)
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phase TEXT NOT NULL,
  duration_seconds INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  relative_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User contest participation
CREATE TABLE IF NOT EXISTS user_contest_participation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  rank INTEGER,
  old_rating INTEGER,
  new_rating INTEGER,
  participated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contest_id)
);

-- College contests
CREATE TABLE IF NOT EXISTS college_contests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  college TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College contest participants
CREATE TABLE IF NOT EXISTS college_contest_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id TEXT NOT NULL REFERENCES college_contests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'problem_solved', 'contest_participated', 'rating_change'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_codeforces_handle ON users(codeforces_handle);
CREATE INDEX IF NOT EXISTS idx_users_college ON users(college);
CREATE INDEX IF NOT EXISTS idx_problems_rating ON problems(rating);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_submissions_user_id ON user_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_submissions_problem_id ON user_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_submissions_verdict ON user_submissions(verdict);
CREATE INDEX IF NOT EXISTS idx_user_contest_participation_user_id ON user_contest_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
