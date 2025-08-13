-- Adding sample contests for testing and fallback data
INSERT INTO contests (id, name, type, phase, duration_seconds, start_time, relative_time_seconds, created_at, updated_at) VALUES
-- Upcoming contests
(9001, 'Codeforces Round #900 (Div. 2)', 'CF', 'BEFORE', 7200, NOW() + INTERVAL '2 days', 172800, NOW(), NOW()),
(9002, 'Educational Codeforces Round #160', 'ICPC', 'BEFORE', 7200, NOW() + INTERVAL '5 days', 432000, NOW(), NOW()),
(9003, 'Codeforces Round #901 (Div. 1)', 'CF', 'BEFORE', 7200, NOW() + INTERVAL '1 week', 604800, NOW(), NOW()),
(9004, 'Codeforces Global Round 27', 'CF', 'BEFORE', 10800, NOW() + INTERVAL '10 days', 864000, NOW(), NOW()),
(9005, 'Educational Codeforces Round #161', 'ICPC', 'BEFORE', 7200, NOW() + INTERVAL '2 weeks', 1209600, NOW(), NOW()),

-- Recent finished contests
(8995, 'Codeforces Round #895 (Div. 2)', 'CF', 'FINISHED', 7200, NOW() - INTERVAL '3 days', -259200, NOW(), NOW()),
(8996, 'Educational Codeforces Round #155', 'ICPC', 'FINISHED', 7200, NOW() - INTERVAL '1 week', -604800, NOW(), NOW()),
(8997, 'Codeforces Round #896 (Div. 1)', 'CF', 'FINISHED', 7200, NOW() - INTERVAL '10 days', -864000, NOW(), NOW()),
(8998, 'Codeforces Global Round 26', 'CF', 'FINISHED', 10800, NOW() - INTERVAL '2 weeks', -1209600, NOW(), NOW()),
(8999, 'Educational Codeforces Round #156', 'ICPC', 'FINISHED', 7200, NOW() - INTERVAL '3 weeks', -1814400, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
