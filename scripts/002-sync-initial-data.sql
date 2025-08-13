-- This script can be run to initially populate problems and contests data
-- Note: This is a placeholder - actual sync should be done via API calls

-- Create a function to sync data (this would typically be called from the API)
CREATE OR REPLACE FUNCTION sync_codeforces_data()
RETURNS TEXT AS $$
BEGIN
  -- This function would be called by the sync APIs
  -- It's here as a placeholder for any additional SQL operations needed
  
  RETURN 'Sync should be performed via API endpoints: /api/sync/problems and /api/sync/contests';
END;
$$ LANGUAGE plpgsql;

-- Add some indexes for better performance on sync operations
CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON user_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_submissions_verdict_user ON user_submissions(user_id, verdict);
CREATE INDEX IF NOT EXISTS idx_problems_contest_id ON problems(contest_id);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_contest_participation_participated_at ON user_contest_participation(participated_at DESC);
