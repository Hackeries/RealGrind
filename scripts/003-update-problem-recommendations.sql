-- Add indexes for better recommendation performance
CREATE INDEX IF NOT EXISTS idx_problems_rating_tags ON problems(rating, tags);
CREATE INDEX IF NOT EXISTS idx_problems_solved_count ON problems(solved_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_submissions_user_verdict ON user_submissions(user_id, verdict);

-- Create a function to calculate problem difficulty levels
CREATE OR REPLACE FUNCTION get_difficulty_level(rating INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF rating IS NULL THEN
    RETURN 'Unrated';
  ELSIF rating < 1200 THEN
    RETURN 'Newbie';
  ELSIF rating < 1400 THEN
    RETURN 'Pupil';
  ELSIF rating < 1600 THEN
    RETURN 'Specialist';
  ELSIF rating < 1900 THEN
    RETURN 'Expert';
  ELSIF rating < 2100 THEN
    RETURN 'Candidate Master';
  ELSE
    RETURN 'Master+';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view for user problem statistics
CREATE OR REPLACE VIEW user_problem_stats AS
SELECT 
  u.id as user_id,
  u.current_rating,
  u.problems_solved,
  COUNT(DISTINCT us.problem_id) as actual_solved,
  ARRAY_AGG(DISTINCT unnest_tags.tag) FILTER (WHERE unnest_tags.tag IS NOT NULL) as solved_tags
FROM users u
LEFT JOIN user_submissions us ON u.id = us.user_id AND us.verdict = 'OK'
LEFT JOIN problems p ON us.problem_id = p.id
LEFT JOIN LATERAL unnest(p.tags) AS unnest_tags(tag) ON true
GROUP BY u.id, u.current_rating, u.problems_solved;

-- Update problem statistics periodically (this would be run by a cron job)
CREATE OR REPLACE FUNCTION update_problem_stats()
RETURNS void AS $$
BEGIN
  -- Update solved counts for problems
  UPDATE problems 
  SET solved_count = subquery.count
  FROM (
    SELECT 
      problem_id,
      COUNT(DISTINCT user_id) as count
    FROM user_submissions
    WHERE verdict = 'OK'
    GROUP BY problem_id
  ) AS subquery
  WHERE problems.id = subquery.problem_id;
  
  -- Update user problem counts
  UPDATE users
  SET problems_solved = subquery.count
  FROM (
    SELECT 
      user_id,
      COUNT(DISTINCT problem_id) as count
    FROM user_submissions
    WHERE verdict = 'OK'
    GROUP BY user_id
  ) AS subquery
  WHERE users.id = subquery.user_id;
END;
$$ LANGUAGE plpgsql;
