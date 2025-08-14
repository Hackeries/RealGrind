-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE codeforces_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Colleges policies
CREATE POLICY "Anyone can view colleges" ON colleges 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage colleges" ON colleges 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contests policies
CREATE POLICY "Anyone can view public contests" ON contests 
  FOR SELECT USING (visibility = 'public' OR type = 'national');

CREATE POLICY "Organizers can manage college contests" ON contests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND (u.role = 'organizer' AND u.college_id = contests.college_id)
      OR u.role = 'admin'
    )
  );

CREATE POLICY "Contest creators can manage their contests" ON contests 
  FOR ALL USING (created_by = auth.uid());

-- Problems policies
CREATE POLICY "Anyone can view problems" ON problems 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organizers and admins can manage problems" ON problems 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON submissions 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own submissions" ON submissions 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Contest participants can view contest submissions" ON submissions 
  FOR SELECT USING (
    contest_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM contest_participants cp 
      WHERE cp.contest_id = submissions.contest_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Contest participants policies
CREATE POLICY "Users can join accessible contests" ON contest_participants 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view contest participants" ON contest_participants 
  FOR SELECT TO authenticated USING (true);

-- Friendships policies
CREATE POLICY "Users can manage their friendships" ON friendships 
  FOR ALL USING (user_id = auth.uid() OR friend_id = auth.uid());

-- User stats policies
CREATE POLICY "Users can view their own stats" ON user_stats 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can view aggregated stats" ON user_stats 
  FOR SELECT TO authenticated USING (true);

-- College requests policies
CREATE POLICY "Users can view their own requests" ON college_requests 
  FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Users can create college requests" ON college_requests 
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can manage college requests" ON college_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verification policies
CREATE POLICY "Users can view their own verifications" ON codeforces_verifications 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verifications" ON codeforces_verifications 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their verification tokens" ON verification_tokens 
  FOR ALL USING (user_id = auth.uid());

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON contests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_college_requests_updated_at BEFORE UPDATE ON college_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
