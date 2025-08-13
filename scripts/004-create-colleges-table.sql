-- Create colleges table with comprehensive Indian engineering colleges data
CREATE TABLE IF NOT EXISTS colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50),
  location VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  type VARCHAR(50) DEFAULT 'Engineering',
  established_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);
CREATE INDEX IF NOT EXISTS idx_colleges_tier ON colleges(tier);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);

-- Insert Tier 1 Engineering Colleges (IITs, NITs, IIITs, etc.)
INSERT INTO colleges (name, short_name, location, state, tier, established_year) VALUES
-- IITs
('Indian Institute of Technology Bombay', 'IIT Bombay', 'Mumbai', 'Maharashtra', 1, 1958),
('Indian Institute of Technology Delhi', 'IIT Delhi', 'New Delhi', 'Delhi', 1, 1961),
('Indian Institute of Technology Kanpur', 'IIT Kanpur', 'Kanpur', 'Uttar Pradesh', 1, 1959),
('Indian Institute of Technology Kharagpur', 'IIT Kharagpur', 'Kharagpur', 'West Bengal', 1, 1951),
('Indian Institute of Technology Madras', 'IIT Madras', 'Chennai', 'Tamil Nadu', 1, 1959),
('Indian Institute of Technology Roorkee', 'IIT Roorkee', 'Roorkee', 'Uttarakhand', 1, 1847),
('Indian Institute of Technology Guwahati', 'IIT Guwahati', 'Guwahati', 'Assam', 1, 1994),
('Indian Institute of Technology Hyderabad', 'IIT Hyderabad', 'Hyderabad', 'Telangana', 1, 2008),
('Indian Institute of Technology Indore', 'IIT Indore', 'Indore', 'Madhya Pradesh', 1, 2009),
('Indian Institute of Technology Mandi', 'IIT Mandi', 'Mandi', 'Himachal Pradesh', 1, 2009),
('Indian Institute of Technology Patna', 'IIT Patna', 'Patna', 'Bihar', 1, 2008),
('Indian Institute of Technology Ropar', 'IIT Ropar', 'Rupnagar', 'Punjab', 1, 2008),
('Indian Institute of Technology Bhubaneswar', 'IIT Bhubaneswar', 'Bhubaneswar', 'Odisha', 1, 2008),
('Indian Institute of Technology Gandhinagar', 'IIT Gandhinagar', 'Gandhinagar', 'Gujarat', 1, 2008),
('Indian Institute of Technology Jodhpur', 'IIT Jodhpur', 'Jodhpur', 'Rajasthan', 1, 2008),
('Indian Institute of Technology Varanasi', 'IIT BHU', 'Varanasi', 'Uttar Pradesh', 1, 1919),
('Indian Institute of Technology Dhanbad', 'IIT Dhanbad', 'Dhanbad', 'Jharkhand', 1, 1926),
('Indian Institute of Technology Tirupati', 'IIT Tirupati', 'Tirupati', 'Andhra Pradesh', 1, 2015),
('Indian Institute of Technology Palakkad', 'IIT Palakkad', 'Palakkad', 'Kerala', 1, 2015),
('Indian Institute of Technology Bhilai', 'IIT Bhilai', 'Bhilai', 'Chhattisgarh', 1, 2016),
('Indian Institute of Technology Goa', 'IIT Goa', 'Goa', 'Goa', 1, 2016),
('Indian Institute of Technology Jammu', 'IIT Jammu', 'Jammu', 'Jammu and Kashmir', 1, 2016),
('Indian Institute of Technology Dharwad', 'IIT Dharwad', 'Dharwad', 'Karnataka', 1, 2016),

-- NITs
('National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 1, 1964),
('National Institute of Technology Karnataka', 'NITK Surathkal', 'Mangalore', 'Karnataka', 1, 1960),
('National Institute of Technology Warangal', 'NIT Warangal', 'Warangal', 'Telangana', 1, 1959),
('National Institute of Technology Calicut', 'NIT Calicut', 'Kozhikode', 'Kerala', 1, 1961),
('National Institute of Technology Durgapur', 'NIT Durgapur', 'Durgapur', 'West Bengal', 1, 1960),
('National Institute of Technology Rourkela', 'NIT Rourkela', 'Rourkela', 'Odisha', 1, 1961),
('National Institute of Technology Kurukshetra', 'NIT Kurukshetra', 'Kurukshetra', 'Haryana', 1, 1963),
('National Institute of Technology Allahabad', 'NIT Allahabad', 'Prayagraj', 'Uttar Pradesh', 1, 1961),
('National Institute of Technology Bhopal', 'NIT Bhopal', 'Bhopal', 'Madhya Pradesh', 1, 1960),
('National Institute of Technology Jaipur', 'NIT Jaipur', 'Jaipur', 'Rajasthan', 1, 1963),
('National Institute of Technology Surat', 'NIT Surat', 'Surat', 'Gujarat', 1, 1961),
('National Institute of Technology Hamirpur', 'NIT Hamirpur', 'Hamirpur', 'Himachal Pradesh', 1, 1986),
('National Institute of Technology Jalandhar', 'NIT Jalandhar', 'Jalandhar', 'Punjab', 1, 1987),
('National Institute of Technology Patna', 'NIT Patna', 'Patna', 'Bihar', 1, 1924),
('National Institute of Technology Silchar', 'NIT Silchar', 'Silchar', 'Assam', 1, 1967),
('National Institute of Technology Agartala', 'NIT Agartala', 'Agartala', 'Tripura', 1, 1965),
('National Institute of Technology Arunachal Pradesh', 'NIT Arunachal Pradesh', 'Yupia', 'Arunachal Pradesh', 1, 2010),
('National Institute of Technology Delhi', 'NIT Delhi', 'New Delhi', 'Delhi', 1, 2010),
('National Institute of Technology Goa', 'NIT Goa', 'Farmagudi', 'Goa', 1, 2010),
('National Institute of Technology Manipur', 'NIT Manipur', 'Imphal', 'Manipur', 1, 2010),
('National Institute of Technology Meghalaya', 'NIT Meghalaya', 'Shillong', 'Meghalaya', 1, 2010),
('National Institute of Technology Mizoram', 'NIT Mizoram', 'Aizawl', 'Mizoram', 1, 2010),
('National Institute of Technology Nagaland', 'NIT Nagaland', 'Dimapur', 'Nagaland', 1, 2010),
('National Institute of Technology Puducherry', 'NIT Puducherry', 'Karaikal', 'Puducherry', 1, 2010),
('National Institute of Technology Sikkim', 'NIT Sikkim', 'Ravangla', 'Sikkim', 1, 2010),
('National Institute of Technology Uttarakhand', 'NIT Uttarakhand', 'Srinagar', 'Uttarakhand', 1, 2009),
('National Institute of Technology Andhra Pradesh', 'NIT Andhra Pradesh', 'Tadepalligudem', 'Andhra Pradesh', 1, 2015),

-- IIITs
('International Institute of Information Technology Hyderabad', 'IIIT Hyderabad', 'Hyderabad', 'Telangana', 1, 1998),
('Indian Institute of Information Technology Allahabad', 'IIIT Allahabad', 'Prayagraj', 'Uttar Pradesh', 1, 1999),
('Indian Institute of Information Technology Gwalior', 'IIIT Gwalior', 'Gwalior', 'Madhya Pradesh', 1, 1997),
('Indian Institute of Information Technology Jabalpur', 'IIIT Jabalpur', 'Jabalpur', 'Madhya Pradesh', 1, 2005),
('Indian Institute of Information Technology Kancheepuram', 'IIIT Kancheepuram', 'Chennai', 'Tamil Nadu', 1, 2001),
('Indian Institute of Information Technology Vadodara', 'IIIT Vadodara', 'Gandhinagar', 'Gujarat', 1, 2013),
('Indian Institute of Information Technology Nagpur', 'IIIT Nagpur', 'Nagpur', 'Maharashtra', 1, 2016),
('Indian Institute of Information Technology Pune', 'IIIT Pune', 'Pune', 'Maharashtra', 1, 2016),
('Indian Institute of Information Technology Kota', 'IIIT Kota', 'Kota', 'Rajasthan', 1, 2013),
('Indian Institute of Information Technology Sonepat', 'IIIT Sonepat', 'Sonepat', 'Haryana', 1, 2014),
('Indian Institute of Information Technology Kalyani', 'IIIT Kalyani', 'Kalyani', 'West Bengal', 1, 2014),
('Indian Institute of Information Technology Tiruchirappalli', 'IIIT Tiruchirappalli', 'Tiruchirappalli', 'Tamil Nadu', 1, 2012),
('Indian Institute of Information Technology Design and Manufacturing Kurnool', 'IIITDM Kurnool', 'Kurnool', 'Andhra Pradesh', 1, 2015),
('Indian Institute of Information Technology Design and Manufacturing Jabalpur', 'IIITDM Jabalpur', 'Jabalpur', 'Madhya Pradesh', 1, 2005),
('Indian Institute of Information Technology Design and Manufacturing Kancheepuram', 'IIITDM Kancheepuram', 'Chennai', 'Tamil Nadu', 1, 2001),

-- Other Premier Institutions
('Indian Institute of Science', 'IISc', 'Bangalore', 'Karnataka', 1, 1909),
('Birla Institute of Technology and Science Pilani', 'BITS Pilani', 'Pilani', 'Rajasthan', 1, 1964),
('Birla Institute of Technology and Science Goa', 'BITS Goa', 'Goa', 'Goa', 1, 2004),
('Birla Institute of Technology and Science Hyderabad', 'BITS Hyderabad', 'Hyderabad', 'Telangana', 1, 2008),
('Delhi Technological University', 'DTU', 'New Delhi', 'Delhi', 1, 1941),
('Netaji Subhas University of Technology', 'NSUT', 'New Delhi', 'Delhi', 1, 1983),
('Indraprastha Institute of Information Technology Delhi', 'IIIT Delhi', 'New Delhi', 'Delhi', 1, 2008),
('International Institute of Information Technology Bangalore', 'IIIT Bangalore', 'Bangalore', 'Karnataka', 1, 1999),
('Vellore Institute of Technology', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 1, 1984),
('Manipal Institute of Technology', 'MIT Manipal', 'Manipal', 'Karnataka', 1, 1957),
('Thapar Institute of Engineering and Technology', 'Thapar University', 'Patiala', 'Punjab', 1, 1956),
('Jadavpur University', 'JU', 'Kolkata', 'West Bengal', 1, 1955),
('Anna University', 'Anna University', 'Chennai', 'Tamil Nadu', 1, 1978),
('Indian Institute of Technology (Indian School of Mines)', 'IIT ISM', 'Dhanbad', 'Jharkhand', 1, 1926);

-- Insert Tier 2 Engineering Colleges
INSERT INTO colleges (name, short_name, location, state, tier, established_year) VALUES
-- State Government Colleges
('Government College of Technology', 'GCT', 'Coimbatore', 'Tamil Nadu', 2, 1945),
('College of Engineering Pune', 'COEP', 'Pune', 'Maharashtra', 2, 1854),
('Visvesvaraya National Institute of Technology', 'VNIT', 'Nagpur', 'Maharashtra', 2, 1960),
('Sardar Vallabhbhai National Institute of Technology', 'SVNIT', 'Surat', 'Gujarat', 2, 1961),
('Motilal Nehru National Institute of Technology', 'MNNIT', 'Allahabad', 'Uttar Pradesh', 2, 1961),
('Malaviya National Institute of Technology', 'MNIT', 'Jaipur', 'Rajasthan', 2, 1963),
('Dr. B R Ambedkar National Institute of Technology', 'NIT Jalandhar', 'Jalandhar', 'Punjab', 2, 1987),
('Maulana Azad National Institute of Technology', 'MANIT', 'Bhopal', 'Madhya Pradesh', 2, 1960),
('Visvesvaraya Technological University', 'VTU', 'Belagavi', 'Karnataka', 2, 1998),
('Jawaharlal Nehru Technological University', 'JNTU', 'Hyderabad', 'Telangana', 2, 1972),
('Osmania University College of Engineering', 'OUCE', 'Hyderabad', 'Telangana', 2, 1929),
('University College of Engineering', 'UCE', 'Osmania University', 'Telangana', 2, 1929),
('Bengal Engineering and Science University', 'BESU', 'Shibpur', 'West Bengal', 2, 1856),
('Indian Institute of Engineering Science and Technology', 'IIEST', 'Shibpur', 'West Bengal', 2, 1856),
('Calcutta University Institute of Technology', 'CUIT', 'Kolkata', 'West Bengal', 2, 2000),
('Kalyani Government Engineering College', 'KGEC', 'Kalyani', 'West Bengal', 2, 1995),
('Jalpaiguri Government Engineering College', 'JGEC', 'Jalpaiguri', 'West Bengal', 2, 1961),
('Cooch Behar Government Engineering College', 'CBGEC', 'Cooch Behar', 'West Bengal', 2, 2001),
('Haldia Institute of Technology', 'HIT', 'Haldia', 'West Bengal', 2, 1996),
('Heritage Institute of Technology', 'HIT', 'Kolkata', 'West Bengal', 2, 2001),

-- Private Colleges (Tier 2)
('SRM Institute of Science and Technology', 'SRMIST', 'Chennai', 'Tamil Nadu', 2, 1985),
('Amrita Vishwa Vidyapeetham', 'Amrita', 'Coimbatore', 'Tamil Nadu', 2, 2003),
('PSG College of Technology', 'PSG Tech', 'Coimbatore', 'Tamil Nadu', 2, 1951),
('Thiagarajar College of Engineering', 'TCE', 'Madurai', 'Tamil Nadu', 2, 1957),
('SSN College of Engineering', 'SSNCE', 'Chennai', 'Tamil Nadu', 2, 1996),
('Kumaraguru College of Technology', 'KCT', 'Coimbatore', 'Tamil Nadu', 2, 1984),
('Kongu Engineering College', 'KEC', 'Erode', 'Tamil Nadu', 2, 1984),
('Bannari Amman Institute of Technology', 'BIT', 'Sathyamangalam', 'Tamil Nadu', 2, 1996),
('Karunya Institute of Technology and Sciences', 'Karunya', 'Coimbatore', 'Tamil Nadu', 2, 1986),
('Vel Tech Rangarajan Dr. Sagunthala R&D Institute', 'Vel Tech', 'Chennai', 'Tamil Nadu', 2, 1997),
('Rajalakshmi Engineering College', 'REC', 'Chennai', 'Tamil Nadu', 2, 1997),
('Sri Sivasubramaniya Nadar College of Engineering', 'SSNCE', 'Chennai', 'Tamil Nadu', 2, 1996),
('Easwari Engineering College', 'EEC', 'Chennai', 'Tamil Nadu', 2, 1996),
('R.M.K. Engineering College', 'RMKEC', 'Chennai', 'Tamil Nadu', 2, 1995),
('Panimalar Engineering College', 'PEC', 'Chennai', 'Tamil Nadu', 2, 2000),

-- Maharashtra Tier 2
('Pune Institute of Computer Technology', 'PICT', 'Pune', 'Maharashtra', 2, 1999),
('Walchand College of Engineering', 'WCE', 'Sangli', 'Maharashtra', 2, 1947),
('Government College of Engineering', 'GCOEA', 'Amravati', 'Maharashtra', 2, 1960),
('Veermata Jijabai Technological Institute', 'VJTI', 'Mumbai', 'Maharashtra', 2, 1887),
('Institute of Chemical Technology', 'ICT', 'Mumbai', 'Maharashtra', 2, 1933),
('Sardar Patel College of Engineering', 'SPCE', 'Mumbai', 'Maharashtra', 2, 1962),
('K. J. Somaiya College of Engineering', 'KJSCE', 'Mumbai', 'Maharashtra', 2, 1983),
('Thadomal Shahani Engineering College', 'TSEC', 'Mumbai', 'Maharashtra', 2, 1983),
('Fr. Conceicao Rodrigues College of Engineering', 'CRCE', 'Mumbai', 'Maharashtra', 2, 1999),
('Atharva College of Engineering', 'ACE', 'Mumbai', 'Maharashtra', 2, 1999),

-- Karnataka Tier 2
('R.V. College of Engineering', 'RVCE', 'Bangalore', 'Karnataka', 2, 1963),
('B.M.S. College of Engineering', 'BMSCE', 'Bangalore', 'Karnataka', 2, 1946),
('M.S. Ramaiah Institute of Technology', 'MSRIT', 'Bangalore', 'Karnataka', 2, 1962),
('PES University', 'PESU', 'Bangalore', 'Karnataka', 2, 1972),
('Dayananda Sagar College of Engineering', 'DSCE', 'Bangalore', 'Karnataka', 2, 1979),
('Sir M. Visvesvaraya Institute of Technology', 'Sir MVIT', 'Bangalore', 'Karnataka', 2, 1986),
('New Horizon College of Engineering', 'NHCE', 'Bangalore', 'Karnataka', 2, 2001),
('Reva University', 'REVA', 'Bangalore', 'Karnataka', 2, 2012),
('Christ University', 'Christ', 'Bangalore', 'Karnataka', 2, 1969),
('Jain University', 'Jain', 'Bangalore', 'Karnataka', 2, 1990),

-- Gujarat Tier 2
('Dhirubhai Ambani Institute of Information and Communication Technology', 'DA-IICT', 'Gandhinagar', 'Gujarat', 2, 2001),
('Institute of Technology Nirma University', 'IT-NU', 'Ahmedabad', 'Gujarat', 2, 2000),
('L.D. College of Engineering', 'LDCE', 'Ahmedabad', 'Gujarat', 2, 1948),
('Government Engineering College', 'GEC', 'Gandhinagar', 'Gujarat', 2, 2004),
('Charotar University of Science and Technology', 'CHARUSAT', 'Anand', 'Gujarat', 2, 2009),
('Pandit Deendayal Energy University', 'PDEU', 'Gandhinagar', 'Gujarat', 2, 2007),
('Adani Institute of Infrastructure Engineering', 'AIIE', 'Ahmedabad', 'Gujarat', 2, 2016),
('Gujarat Technological University', 'GTU', 'Ahmedabad', 'Gujarat', 2, 2007),
('Marwadi University', 'Marwadi', 'Rajkot', 'Gujarat', 2, 2009),
('Ganpat University', 'Ganpat', 'Mehsana', 'Gujarat', 2, 1994);

-- Insert Tier 3 Engineering Colleges (Representative sample)
INSERT INTO colleges (name, short_name, location, state, tier, established_year) VALUES
-- Uttar Pradesh Tier 3
('Harcourt Butler Technical University', 'HBTU', 'Kanpur', 'Uttar Pradesh', 3, 1921),
('Bundelkhand Institute of Engineering and Technology', 'BIET', 'Jhansi', 'Uttar Pradesh', 3, 1998),
('United College of Engineering and Research', 'UCER', 'Allahabad', 'Uttar Pradesh', 3, 2000),
('Kamla Nehru Institute of Technology', 'KNIT', 'Sultanpur', 'Uttar Pradesh', 3, 1976),
('Galgotias College of Engineering and Technology', 'GCET', 'Greater Noida', 'Uttar Pradesh', 3, 2000),
('ABES Engineering College', 'ABES', 'Ghaziabad', 'Uttar Pradesh', 3, 2000),
('Ajay Kumar Garg Engineering College', 'AKGEC', 'Ghaziabad', 'Uttar Pradesh', 3, 1998),
('Krishna Institute of Engineering and Technology', 'KIET', 'Ghaziabad', 'Uttar Pradesh', 3, 2000),
('GL Bajaj Institute of Technology and Management', 'GLBITM', 'Greater Noida', 'Uttar Pradesh', 3, 1998),
('JSS Academy of Technical Education', 'JSSATE', 'Noida', 'Uttar Pradesh', 3, 1998),

-- Rajasthan Tier 3
('Rajasthan Technical University', 'RTU', 'Kota', 'Rajasthan', 3, 2006),
('Government Engineering College', 'GEC', 'Ajmer', 'Rajasthan', 3, 1997),
('Poornima College of Engineering', 'PCE', 'Jaipur', 'Rajasthan', 3, 2000),
('Arya College of Engineering and IT', 'ACE&IT', 'Jaipur', 'Rajasthan', 3, 2000),
('Jaipur Engineering College and Research Centre', 'JECRC', 'Jaipur', 'Rajasthan', 3, 2000),
('Modi Institute of Technology', 'MIT', 'Kota', 'Rajasthan', 3, 2000),
('Swami Keshvanand Institute of Technology', 'SKIT', 'Jaipur', 'Rajasthan', 3, 2000),
('Global Institute of Technology', 'GIT', 'Jaipur', 'Rajasthan', 3, 2009),
('Maharishi Arvind Institute of Engineering and Technology', 'MAIET', 'Jaipur', 'Rajasthan', 3, 2000),
('Kautilya Institute of Technology and Engineering', 'KITE', 'Jaipur', 'Rajasthan', 3, 2009),

-- Haryana Tier 3
('Deenbandhu Chhotu Ram University of Science and Technology', 'DCRUST', 'Murthal', 'Haryana', 3, 2006),
('Guru Jambheshwar University of Science and Technology', 'GJUST', 'Hisar', 'Haryana', 3, 1995),
('Maharishi Markandeshwar University', 'MMU', 'Mullana', 'Haryana', 3, 1993),
('Amity University', 'Amity', 'Gurgaon', 'Haryana', 3, 2010),
('The NorthCap University', 'NCU', 'Gurgaon', 'Haryana', 3, 1996),
('Manav Rachna International Institute of Research and Studies', 'MRIIRS', 'Faridabad', 'Haryana', 3, 2008),
('SRM University', 'SRM', 'Sonepat', 'Haryana', 3, 2013),
('Ansal University', 'Ansal', 'Gurgaon', 'Haryana', 3, 2012),
('GD Goenka University', 'GDGU', 'Gurgaon', 'Haryana', 3, 2013),
('World University of Design', 'WUD', 'Sonepat', 'Haryana', 3, 2018),

-- Punjab Tier 3
('Punjabi University', 'PU', 'Patiala', 'Punjab', 3, 1962),
('Guru Nanak Dev University', 'GNDU', 'Amritsar', 'Punjab', 3, 1969),
('Punjab Technical University', 'PTU', 'Jalandhar', 'Punjab', 3, 1997),
('Lovely Professional University', 'LPU', 'Phagwara', 'Punjab', 3, 2005),
('Chandigarh University', 'CU', 'Mohali', 'Punjab', 3, 2012),
('Chitkara University', 'Chitkara', 'Rajpura', 'Punjab', 3, 2010),
('Rayat Bahra University', 'RBU', 'Mohali', 'Punjab', 3, 2012),
('Desh Bhagat University', 'DBU', 'Mandi Gobindgarh', 'Punjab', 3, 2012),
('Aryans Group of Colleges', 'AGC', 'Chandigarh', 'Punjab', 3, 2006),
('DAV Institute of Engineering and Technology', 'DAVIET', 'Jalandhar', 'Punjab', 3, 1983),

-- Madhya Pradesh Tier 3
('Rajiv Gandhi Proudyogiki Vishwavidyalaya', 'RGPV', 'Bhopal', 'Madhya Pradesh', 3, 1998),
('Shri Govindram Seksaria Institute of Technology and Science', 'SGSITS', 'Indore', 'Madhya Pradesh', 3, 1952),
('Institute of Engineering and Technology DAVV', 'IET DAVV', 'Indore', 'Madhya Pradesh', 3, 1987),
('Ujjain Engineering College', 'UEC', 'Ujjain', 'Madhya Pradesh', 3, 1966),
('Samrat Ashok Technological Institute', 'SATI', 'Vidisha', 'Madhya Pradesh', 3, 1960),
('Government Engineering College', 'GEC', 'Jabalpur', 'Madhya Pradesh', 3, 1947),
('Lakshmi Narain College of Technology', 'LNCT', 'Bhopal', 'Madhya Pradesh', 3, 1994),
('Oriental Institute of Science and Technology', 'OIST', 'Bhopal', 'Madhya Pradesh', 3, 1995),
('Truba Institute of Engineering and Information Technology', 'TIEIT', 'Bhopal', 'Madhya Pradesh', 3, 2000),
('Acropolis Institute of Technology and Research', 'AITR', 'Indore', 'Madhya Pradesh', 3, 2003),

-- Odisha Tier 3
('National Institute of Science and Technology', 'NIST', 'Berhampur', 'Odisha', 3, 1996),
('Institute of Technical Education and Research', 'ITER', 'Bhubaneswar', 'Odisha', 3, 1996),
('College of Engineering and Technology', 'CET', 'Bhubaneswar', 'Odisha', 3, 1981),
('Gandhi Institute for Technology', 'GIFT', 'Bhubaneswar', 'Odisha', 3, 1997),
('Kalinga Institute of Industrial Technology', 'KIIT', 'Bhubaneswar', 'Odisha', 3, 1992),
('Silicon Institute of Technology', 'SIT', 'Bhubaneswar', 'Odisha', 3, 1996),
('Centurion University of Technology and Management', 'CUTM', 'Bhubaneswar', 'Odisha', 3, 2010),
('Indira Gandhi Institute of Technology', 'IGIT', 'Sarang', 'Odisha', 3, 1982),
('Veer Surendra Sai University of Technology', 'VSSUT', 'Burla', 'Odisha', 3, 1956),
('Government College of Engineering', 'GCEK', 'Keonjhar', 'Odisha', 3, 2009),

-- Jharkhand Tier 3
('Birla Institute of Technology', 'BIT', 'Mesra', 'Jharkhand', 3, 1955),
('National Institute of Technology Jamshedpur', 'NIT Jamshedpur', 'Jamshedpur', 'Jharkhand', 3, 1960),
('University College of Engineering and Technology', 'UCET', 'Hazaribagh', 'Jharkhand', 3, 2009),
('Jharkhand University of Technology', 'JUT', 'Ranchi', 'Jharkhand', 3, 2009),
('Central Institute of Technology', 'CIT', 'Kokrajhar', 'Jharkhand', 3, 2006),
('Karim City College', 'KCC', 'Jamshedpur', 'Jharkhand', 3, 2001),
('RVS College of Engineering and Technology', 'RVSCET', 'Jamshedpur', 'Jharkhand', 3, 2001),
('Netaji Subhash Engineering College', 'NSEC', 'Gaya', 'Jharkhand', 3, 2007),
('Cambridge Institute of Technology', 'CIT', 'Ranchi', 'Jharkhand', 3, 2001),
('Techno India', 'Techno', 'Ranchi', 'Jharkhand', 3, 2009),

-- Chhattisgarh Tier 3
('National Institute of Technology Raipur', 'NIT Raipur', 'Raipur', 'Chhattisgarh', 3, 2005),
('Chhattisgarh Swami Vivekanand Technical University', 'CSVTU', 'Bhilai', 'Chhattisgarh', 3, 2005),
('Government Engineering College', 'GEC', 'Raipur', 'Chhattisgarh', 3, 1956),
('Bhilai Institute of Technology', 'BIT', 'Durg', 'Chhattisgarh', 3, 1986),
('Shri Shankaracharya Technical Campus', 'SSTC', 'Bhilai', 'Chhattisgarh', 3, 1999),
('Chouksey Engineering College', 'CEC', 'Bilaspur', 'Chhattisgarh', 3, 2009),
('Rungta College of Engineering and Technology', 'RCET', 'Bhilai', 'Chhattisgarh', 3, 2000),
('Columbia Institute of Engineering and Technology', 'CIET', 'Raipur', 'Chhattisgarh', 3, 2009),
('Kalinga University', 'KU', 'Raipur', 'Chhattisgarh', 3, 2013),
('ISBM University', 'ISBM', 'Raipur', 'Chhattisgarh', 3, 2016),

-- Assam Tier 3
('Assam Engineering College', 'AEC', 'Guwahati', 'Assam', 3, 1955),
('Jorhat Engineering College', 'JEC', 'Jorhat', 'Assam', 3, 1960),
('Tezpur University', 'TU', 'Tezpur', 'Assam', 3, 1994),
('Girijananda Chowdhury Institute of Management and Technology', 'GCIMT', 'Guwahati', 'Assam', 3, 2010),
('Royal School of Engineering and Technology', 'RSET', 'Guwahati', 'Assam', 3, 2009),
('Assam Science and Technology University', 'ASTU', 'Guwahati', 'Assam', 3, 2010),
('Don Bosco University', 'DBU', 'Guwahati', 'Assam', 3, 2008),
('Kaziranga University', 'KU', 'Jorhat', 'Assam', 3, 2013),
('University of Science and Technology Meghalaya', 'USTM', 'Meghalaya', 'Assam', 3, 2008),
('Assam Down Town University', 'AdtU', 'Guwahati', 'Assam', 3, 2010);

-- Update users table to include college reference
ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id INTEGER REFERENCES colleges(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS codeforces_handle VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS codeforces_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_problem_id VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_submission_id VARCHAR(20);

-- Create index for faster college lookups
CREATE INDEX IF NOT EXISTS idx_users_college_id ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_users_codeforces_handle ON users(codeforces_handle);
