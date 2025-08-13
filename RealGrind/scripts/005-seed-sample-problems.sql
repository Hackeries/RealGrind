-- Adding sample problems for testing and fallback data
INSERT INTO problems (id, contest_id, index, name, type, rating, tags, created_at, updated_at) VALUES
-- Easy problems (800-1200)
('1A', 1, 'A', 'Theatre Square', 'PROGRAMMING', 1000, ARRAY['math', 'implementation'], NOW(), NOW()),
('4A', 4, 'A', 'Watermelon', 'PROGRAMMING', 800, ARRAY['brute force', 'implementation'], NOW(), NOW()),
('71A', 71, 'A', 'Way Too Long Words', 'PROGRAMMING', 800, ARRAY['strings', 'implementation'], NOW(), NOW()),
('158A', 158, 'A', 'Next Round', 'PROGRAMMING', 800, ARRAY['implementation'], NOW(), NOW()),
('231A', 231, 'A', 'Team', 'PROGRAMMING', 800, ARRAY['brute force', 'greedy'], NOW(), NOW()),
('282A', 282, 'A', 'Bit++', 'PROGRAMMING', 800, ARRAY['implementation'], NOW(), NOW()),
('112A', 112, 'A', 'Petya and Strings', 'PROGRAMMING', 800, ARRAY['implementation', 'strings'], NOW(), NOW()),
('263A', 263, 'A', 'Beautiful Matrix', 'PROGRAMMING', 800, ARRAY['implementation'], NOW(), NOW()),
('339A', 339, 'A', 'Helpful Maths', 'PROGRAMMING', 800, ARRAY['greedy', 'implementation', 'sortings', 'strings'], NOW(), NOW()),
('281A', 281, 'A', 'Word Capitalization', 'PROGRAMMING', 800, ARRAY['implementation', 'strings'], NOW(), NOW()),

-- Medium problems (1200-1600)
('1B', 1, 'B', 'Spreadsheets', 'PROGRAMMING', 1600, ARRAY['implementation', 'math'], NOW(), NOW()),
('4B', 4, 'B', 'Before an Exam', 'PROGRAMMING', 1200, ARRAY['greedy', 'implementation'], NOW(), NOW()),
('158B', 158, 'B', 'Taxi', 'PROGRAMMING', 1100, ARRAY['greedy', 'implementation'], NOW(), NOW()),
('492B', 492, 'B', 'Vanya and Lanterns', 'PROGRAMMING', 1200, ARRAY['binary search', 'implementation', 'sortings'], NOW(), NOW()),
('580A', 580, 'A', 'Kefa and First Steps', 'PROGRAMMING', 900, ARRAY['brute force', 'dp', 'implementation'], NOW(), NOW()),
('451B', 451, 'B', 'Sort the Array', 'PROGRAMMING', 1300, ARRAY['implementation', 'sortings'], NOW(), NOW()),
('474B', 474, 'B', 'Worms', 'PROGRAMMING', 1200, ARRAY['binary search', 'implementation'], NOW(), NOW()),
('459B', 459, 'B', 'Pashmak and Flowers', 'PROGRAMMING', 1300, ARRAY['combinatorics', 'implementation'], NOW(), NOW()),
('313B', 313, 'B', 'Ilya and Queries', 'PROGRAMMING', 1100, ARRAY['dp', 'implementation'], NOW(), NOW()),
('456A', 456, 'A', 'Laptops', 'PROGRAMMING', 1000, ARRAY['constructive algorithms', 'sortings'], NOW(), NOW()),

-- Hard problems (1600+)
('1C', 1, 'C', 'Ancient Berland Circus', 'PROGRAMMING', 2100, ARRAY['geometry', 'math'], NOW(), NOW()),
('4C', 4, 'C', 'Registration System', 'PROGRAMMING', 1300, ARRAY['data structures', 'hashing', 'implementation'], NOW(), NOW()),
('158C', 158, 'C', 'Cd and pwd commands', 'PROGRAMMING', 1400, ARRAY['implementation', 'strings'], NOW(), NOW()),
('492C', 492, 'C', 'Vanya and Exams', 'PROGRAMMING', 1400, ARRAY['greedy', 'sortings'], NOW(), NOW()),
('580B', 580, 'B', 'Kefa and Company', 'PROGRAMMING', 1500, ARRAY['binary search', 'sortings', 'two pointers'], NOW(), NOW()),
('451C', 451, 'C', 'Predict Outcome of the Game', 'PROGRAMMING', 1500, ARRAY['brute force', 'math'], NOW(), NOW()),
('474C', 474, 'C', 'Captain Marmot', 'PROGRAMMING', 1600, ARRAY['brute force', 'geometry'], NOW(), NOW()),
('459C', 459, 'C', 'Pashmak and Buses', 'PROGRAMMING', 1600, ARRAY['constructive algorithms', 'greedy'], NOW(), NOW()),
('313C', 313, 'C', 'Ilya and Matrix', 'PROGRAMMING', 1600, ARRAY['greedy', 'implementation'], NOW(), NOW()),
('456B', 456, 'B', 'Fedya and Maths', 'PROGRAMMING', 1300, ARRAY['math', 'number theory'], NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
