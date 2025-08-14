-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('student', 'organizer', 'admin')) DEFAULT 'student',
  codeforces_handle TEXT,
  college_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colleges table
CREATE TABLE public.colleges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  tier INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contests table
CREATE TABLE public.contests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT CHECK (type IN ('college', 'national')) DEFAULT 'college',
  college_id INTEGER REFERENCES colleges(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create problems table
CREATE TABLE public.problems (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rating INTEGER,
  tags TEXT[],
  platform TEXT DEFAULT 'codeforces',
  problem_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER REFERENCES problems(id),
  contest_id INTEGER REFERENCES contests(id),
  status TEXT NOT NULL,
  language TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample colleges
INSERT INTO colleges (name, location, tier) VALUES
('Indian Institute of Technology Delhi', 'New Delhi', 1),
('Indian Institute of Technology Bombay', 'Mumbai', 1),
('Indian Institute of Technology Kanpur', 'Kanpur', 1),
('National Institute of Technology Trichy', 'Tiruchirappalli', 1),
('Delhi Technological University', 'New Delhi', 2),
('Netaji Subhas University of Technology', 'New Delhi', 2);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view colleges" ON colleges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view contests" ON contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view problems" ON problems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
