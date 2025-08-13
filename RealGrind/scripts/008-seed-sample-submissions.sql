-- Adding sample submissions for testing user stats and activity feeds
INSERT INTO user_submissions (user_id, problem_id, contest_id, submission_id, verdict, programming_language, submitted_at, created_at, updated_at) VALUES
-- Submissions for sample-1 (Arjun Sharma - IIT Delhi)
('sample-1', '4A', 4, 12345001, 'OK', 'GNU C++17', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-1', '71A', 71, 12345002, 'OK', 'GNU C++17', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-1', '158A', 158, 12345003, 'OK', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-1', '231A', 231, 12345004, 'WRONG_ANSWER', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-1', '231A', 231, 12345005, 'OK', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-1', '1B', 1, 12345006, 'OK', 'GNU C++17', NOW() - INTERVAL '4 days', NOW(), NOW()),
('sample-1', '4B', 4, 12345007, 'TIME_LIMIT_EXCEEDED', 'GNU C++17', NOW() - INTERVAL '5 days', NOW(), NOW()),
('sample-1', '4B', 4, 12345008, 'OK', 'GNU C++17', NOW() - INTERVAL '5 days', NOW(), NOW()),

-- Submissions for sample-4 (Sneha Gupta - IIT Bombay)
('sample-4', '4A', 4, 12345101, 'OK', 'Python 3', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-4', '71A', 71, 12345102, 'OK', 'Python 3', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-4', '158A', 158, 12345103, 'OK', 'Python 3', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-4', '1B', 1, 12345104, 'OK', 'GNU C++17', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-4', '1C', 1, 12345105, 'OK', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-4', '4C', 4, 12345106, 'OK', 'GNU C++17', NOW() - INTERVAL '4 days', NOW(), NOW()),

-- Submissions for sample-6 (Ananya Joshi - BITS Pilani)
('sample-6', '4A', 4, 12345201, 'OK', 'Java 8', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-6', '71A', 71, 12345202, 'OK', 'Java 8', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-6', '158A', 158, 12345203, 'COMPILATION_ERROR', 'Java 8', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-6', '158A', 158, 12345204, 'OK', 'Java 8', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-6', '4B', 4, 12345205, 'OK', 'Java 8', NOW() - INTERVAL '4 days', NOW(), NOW()),

-- Submissions for sample-10 (Ravi Krishnan - IIIT Hyderabad)
('sample-10', '4A', 4, 12345301, 'OK', 'GNU C++17', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-10', '71A', 71, 12345302, 'OK', 'GNU C++17', NOW() - INTERVAL '1 day', NOW(), NOW()),
('sample-10', '158A', 158, 12345303, 'OK', 'GNU C++17', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-10', '1B', 1, 12345304, 'WRONG_ANSWER', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-10', '1B', 1, 12345305, 'OK', 'GNU C++17', NOW() - INTERVAL '3 days', NOW(), NOW()),

-- Submissions for sample-12 (Harsh Bansal - DTU)
('sample-12', '4A', 4, 12345401, 'OK', 'Python 3', NOW() - INTERVAL '2 days', NOW(), NOW()),
('sample-12', '71A', 71, 12345402, 'OK', 'Python 3', NOW() - INTERVAL '3 days', NOW(), NOW()),
('sample-12', '158A', 158, 12345403, 'RUNTIME_ERROR', 'Python 3', NOW() - INTERVAL '4 days', NOW(), NOW()),
('sample-12', '158A', 158, 12345404, 'OK', 'Python 3', NOW() - INTERVAL '4 days', NOW(), NOW())

ON CONFLICT (user_id, problem_id, submission_id) DO NOTHING;
