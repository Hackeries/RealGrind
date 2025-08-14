-- Insert sample colleges for testing
INSERT INTO colleges (name, state, tier) VALUES
('Indian Institute of Technology Delhi', 'Delhi', 1),
('Indian Institute of Technology Bombay', 'Maharashtra', 1),
('Indian Institute of Technology Kanpur', 'Uttar Pradesh', 1),
('National Institute of Technology Trichy', 'Tamil Nadu', 2),
('National Institute of Technology Warangal', 'Telangana', 2),
('Delhi Technological University', 'Delhi', 2),
('Birla Institute of Technology and Science Pilani', 'Rajasthan', 2),
('Vellore Institute of Technology', 'Tamil Nadu', 3),
('SRM Institute of Science and Technology', 'Tamil Nadu', 3),
('Manipal Institute of Technology', 'Karnataka', 3)
ON CONFLICT (name) DO NOTHING;
