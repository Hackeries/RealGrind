-- Adding sample activities for testing activity feeds
INSERT INTO activities (user_id, type, data, created_at) VALUES
-- Recent activities for sample users
('sample-1', 'problem_solved', '{"problem_id": "4A", "problem_name": "Watermelon", "rating": 800, "verdict": "OK"}', NOW() - INTERVAL '1 day'),
('sample-1', 'problem_solved', '{"problem_id": "71A", "problem_name": "Way Too Long Words", "rating": 800, "verdict": "OK"}', NOW() - INTERVAL '2 days'),
('sample-1', 'problem_solved', '{"problem_id": "1B", "problem_name": "Spreadsheets", "rating": 1600, "verdict": "OK"}', NOW() - INTERVAL '4 days'),

('sample-4', 'problem_solved', '{"problem_id": "1C", "problem_name": "Ancient Berland Circus", "rating": 2100, "verdict": "OK"}', NOW() - INTERVAL '3 days'),
('sample-4', 'problem_solved', '{"problem_id": "4C", "problem_name": "Registration System", "rating": 1300, "verdict": "OK"}', NOW() - INTERVAL '4 days'),
('sample-4', 'rating_change', '{"old_rating": 1880, "new_rating": 1900, "contest_name": "Codeforces Round #895"}', NOW() - INTERVAL '3 days'),

('sample-6', 'problem_solved', '{"problem_id": "4A", "problem_name": "Watermelon", "rating": 800, "verdict": "OK"}', NOW() - INTERVAL '1 day'),
('sample-6', 'problem_solved', '{"problem_id": "4B", "problem_name": "Before an Exam", "rating": 1200, "verdict": "OK"}', NOW() - INTERVAL '4 days'),

('sample-10', 'problem_solved', '{"problem_id": "1B", "problem_name": "Spreadsheets", "rating": 1600, "verdict": "OK"}', NOW() - INTERVAL '3 days'),
('sample-10', 'rating_change', '{"old_rating": 1680, "new_rating": 1700, "contest_name": "Educational Round #155"}', NOW() - INTERVAL '1 week'),

('sample-12', 'problem_solved', '{"problem_id": "158A", "problem_name": "Next Round", "rating": 800, "verdict": "OK"}', NOW() - INTERVAL '4 days'),
('sample-12', 'contest_participated', '{"contest_name": "Codeforces Round #895", "rank": 1250, "rating_change": 15}', NOW() - INTERVAL '3 days')

ON CONFLICT DO NOTHING;
