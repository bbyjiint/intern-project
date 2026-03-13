INSERT INTO "Skills" (id, name, category, "createdAt", "updatedAt")
VALUES
-- Programming Languages
(gen_random_uuid(), 'Python', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'JavaScript', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'TypeScript', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Java', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'C', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'C++', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'C#', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Go', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Rust', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'PHP', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Kotlin', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Swift', 'TECHNICAL', NOW(), NOW()),

-- Web / Frontend
(gen_random_uuid(), 'HTML', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'CSS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'React', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Next.js', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Vue.js', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Angular', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Tailwind CSS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Bootstrap', 'TECHNICAL', NOW(), NOW()),

-- Backend / API
(gen_random_uuid(), 'Node.js', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Express.js', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'NestJS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Django', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Flask', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Spring Boot', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'ASP.NET', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'REST API', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'GraphQL', 'TECHNICAL', NOW(), NOW()),

-- Databases
(gen_random_uuid(), 'SQL', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'PostgreSQL', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'MySQL', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'SQLite', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'MongoDB', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Redis', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Oracle', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Microsoft SQL Server', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Prisma', 'TECHNICAL', NOW(), NOW()),

-- DevOps / Cloud
(gen_random_uuid(), 'Docker', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Kubernetes', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'AWS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'GCP', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Azure', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'CI/CD', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Linux', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Windows', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'macOS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Edge Computing', 'TECHNICAL', NOW(), NOW()),

-- Data / AI
(gen_random_uuid(), 'Machine Learning', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Deep Learning', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Data Analysis', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Data Science', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'TensorFlow', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'PyTorch', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Pandas', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'NumPy', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'R Programming', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Natural Language Processing (NLP)', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Computer Vision', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Reinforcement Learning', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Apache Spark', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'MATLAB', 'TECHNICAL', NOW(), NOW()),

-- Data Visualization
(gen_random_uuid(), 'Tableau', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Power BI', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Data Visualization', 'TECHNICAL', NOW(), NOW()),

-- Tools
(gen_random_uuid(), 'Git', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'GitHub', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'GitLab', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Postman', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Figma', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Jira', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Asana', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Trello', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Microsoft Project', 'TECHNICAL', NOW(), NOW()),

-- Cybersecurity
(gen_random_uuid(), 'Network Security', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Ethical Hacking', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Cryptography', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Incident Response', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'SIEM', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Cybersecurity', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Information Security', 'TECHNICAL', NOW(), NOW()),

-- Soft Skills
(gen_random_uuid(), 'Communication', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Teamwork', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Problem Solving', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Time Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Leadership', 'BUSINESS', NOW(), NOW()),

-- Business & Management
(gen_random_uuid(), 'Project Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Product Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Business Analysis', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Strategic Planning', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Operations Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Risk Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Change Management', 'BUSINESS', NOW(), NOW()),

-- Marketing & Sales
(gen_random_uuid(), 'Digital Marketing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Content Marketing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'SEO', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Social Media Marketing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Brand Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Market Research', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Sales Strategy', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Customer Relationship Management (CRM)', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Account Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Salesforce', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'HubSpot', 'BUSINESS', NOW(), NOW()),

-- Office Software
(gen_random_uuid(), 'Microsoft Office', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Microsoft Word', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Microsoft Excel', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Microsoft PowerPoint', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Google Workspace', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Google Docs', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Google Sheets', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'QuickBooks', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'File Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Email Management', 'BUSINESS', NOW(), NOW()),

-- Design & Creative
(gen_random_uuid(), 'Graphic Design', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'UI Design', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'UX Research', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Visual Design', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Motion Graphics', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Video Editing', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Photography', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Illustration', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Adobe Creative Suite', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Adobe Photoshop', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Adobe Illustrator', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Adobe InDesign', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Adobe Premiere Pro', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Sketch', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'InVision', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'AutoCAD', 'TECHNICAL', NOW(), NOW()),

-- Writing & Communication
(gen_random_uuid(), 'Technical Writing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Copywriting', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Public Speaking', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Presentation Skills', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Business Writing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Translation', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Editing & Proofreading', 'BUSINESS', NOW(), NOW()),

-- Finance & Accounting
(gen_random_uuid(), 'Accounting', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Financial Analysis', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Budgeting', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Auditing', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Taxation', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Cost Control', 'BUSINESS', NOW(), NOW()),

-- Human Resources
(gen_random_uuid(), 'Recruitment', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Talent Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Employee Relations', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Payroll Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Training & Development', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Performance Management', 'BUSINESS', NOW(), NOW()),

-- Education & Training
(gen_random_uuid(), 'Teaching', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Curriculum Development', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Academic Research', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Instructional Design', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Student Advising', 'BUSINESS', NOW(), NOW()),

-- Healthcare & Science
(gen_random_uuid(), 'Clinical Research', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Patient Care', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Medical Laboratory Skills', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Public Health', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Healthcare Administration', 'BUSINESS', NOW(), NOW()),

-- Operations & Logistics
(gen_random_uuid(), 'Supply Chain Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Logistics Planning', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Inventory Management', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Procurement', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Quality Assurance', 'BUSINESS', NOW(), NOW()),

-- Customer & Service
(gen_random_uuid(), 'Customer Service', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Client Support', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Complaint Handling', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Service Excellence', 'BUSINESS', NOW(), NOW()),

-- Soft Skills (General)
(gen_random_uuid(), 'Critical Thinking', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Adaptability', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Creativity', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Emotional Intelligence', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Conflict Resolution', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Decision Making', 'BUSINESS', NOW(), NOW()),
(gen_random_uuid(), 'Attention to Detail', 'BUSINESS', NOW(), NOW()),

-- Emerging Technologies
(gen_random_uuid(), 'Blockchain', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Smart Contracts', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Cryptocurrency', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Internet of Things (IoT)', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'IoT Development', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Quantum Computing', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), '5G Technology', 'TECHNICAL', NOW(), NOW()),

-- Networking & Infrastructure
(gen_random_uuid(), 'Network Administration', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'TCP/IP', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'DHCP', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'DNS', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'VPN', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Firewall Configuration', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Active Directory', 'TECHNICAL', NOW(), NOW()),
(gen_random_uuid(), 'Virtualization', 'TECHNICAL', NOW(), NOW())

ON CONFLICT (name) DO UPDATE
SET
  category = EXCLUDED.category,
  "updatedAt" = NOW();
