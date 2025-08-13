-- Adding sample users for leaderboard testing and fallback data
-- Note: These are sample users for testing purposes only

-- Sample users from different colleges for testing leaderboard functionality
INSERT INTO users (id, email, name, image, codeforces_handle, codeforces_verified, college_id, graduation_year, current_rating, max_rating, problems_solved, contests_participated, created_at, updated_at) VALUES
-- IIT Delhi students
('sample-1', 'student1@iitd.ac.in', 'Arjun Sharma', NULL, 'arjun_codes', true, 1, 2024, 1850, 1920, 450, 25, NOW(), NOW()),
('sample-2', 'student2@iitd.ac.in', 'Priya Patel', NULL, 'priya_cp', true, 1, 2025, 1650, 1720, 380, 18, NOW(), NOW()),
('sample-3', 'student3@iitd.ac.in', 'Rohit Kumar', NULL, 'rohit_algo', true, 1, 2024, 1750, 1850, 420, 22, NOW(), NOW()),

-- IIT Bombay students
('sample-4', 'student1@iitb.ac.in', 'Sneha Gupta', NULL, 'sneha_competitive', true, 2, 2024, 1900, 2050, 520, 30, NOW(), NOW()),
('sample-5', 'student2@iitb.ac.in', 'Vikram Singh', NULL, 'vikram_coder', true, 2, 2025, 1600, 1680, 350, 16, NOW(), NOW()),

-- BITS Pilani students
('sample-6', 'student1@pilani.bits-pilani.ac.in', 'Ananya Joshi', NULL, 'ananya_bits', true, 5, 2024, 1550, 1620, 320, 14, NOW(), NOW()),
('sample-7', 'student2@pilani.bits-pilani.ac.in', 'Karthik Reddy', NULL, 'karthik_cp', true, 5, 2025, 1450, 1500, 280, 12, NOW(), NOW()),

-- NIT Trichy students
('sample-8', 'student1@nitt.edu', 'Meera Nair', NULL, 'meera_nitt', true, 11, 2024, 1400, 1480, 250, 10, NOW(), NOW()),
('sample-9', 'student2@nitt.edu', 'Aditya Verma', NULL, 'aditya_trichy', true, 11, 2025, 1350, 1420, 220, 8, NOW(), NOW()),

-- IIIT Hyderabad students
('sample-10', 'student1@iiit.ac.in', 'Ravi Krishnan', NULL, 'ravi_iiith', true, 7, 2024, 1700, 1780, 400, 20, NOW(), NOW()),
('sample-11', 'student2@iiit.ac.in', 'Divya Agarwal', NULL, 'divya_hyd', true, 7, 2025, 1500, 1580, 300, 15, NOW(), NOW()),

-- DTU students
('sample-12', 'student1@dtu.ac.in', 'Harsh Bansal', NULL, 'harsh_dtu', true, 25, 2024, 1300, 1380, 200, 7, NOW(), NOW()),
('sample-13', 'student2@dtu.ac.in', 'Pooja Sharma', NULL, 'pooja_delhi', true, 25, 2025, 1250, 1320, 180, 6, NOW(), NOW()),

-- VIT Vellore students
('sample-14', 'student1@vit.ac.in', 'Suresh Babu', NULL, 'suresh_vit', true, 30, 2024, 1200, 1280, 160, 5, NOW(), NOW()),
('sample-15', 'student2@vit.ac.in', 'Kavya Menon', NULL, 'kavya_vellore', true, 30, 2025, 1150, 1220, 140, 4, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
