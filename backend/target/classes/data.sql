-- ═══════════════════════════════════
-- Demo Data for Service Matchmaker
-- ═══════════════════════════════════

-- Volunteers (password: demo1234 for all)
INSERT IGNORE INTO volunteers (name, email, password, skills, hours_logged, phone, address) VALUES
('Sarah Chen', 'sarah@demo.com', 'demo1234', 'Python, Data Analysis, Teaching', 32, '555-0101', '123 Oak Street, Springfield'),
('Marcus Johnson', 'marcus@demo.com', 'demo1234', 'Java, React, Web Design', 18, '555-0102', '456 Elm Avenue, Riverside'),
('Priya Patel', 'priya@demo.com', 'demo1234', 'First Aid, Event Planning, Photography', 55, '555-0103', '789 Pine Road, Lakewood'),
('Alex Rivera', 'alex@demo.com', 'demo1234', 'Construction, Plumbing, Electrical', 8, '555-0104', '321 Cedar Lane, Maplewood'),
('Emily Wong', 'emily@demo.com', 'demo1234', 'Cooking, Nutrition, Public Speaking', 42, '555-0105', '654 Birch Court, Oakville');

-- Events
INSERT IGNORE INTO events (title, description, location, event_date, event_time, required_skill, required_volunteers, current_volunteers, duration_hours, status) VALUES
('Community Garden Cleanup', 'Help us clean up and replant the community garden. Bring gloves and sunscreen!', 'Riverside Community Garden, 100 Main St', '2026-04-05', '09:00', '', 15, 4, 4, 'UPCOMING'),
('Coding Workshop for Kids', 'Teach basic Python programming to middle schoolers. No teaching experience required — just patience!', 'Springfield Library, 200 Book Ave', '2026-04-12', '14:00', 'Python', 8, 2, 3, 'UPCOMING'),
('Beach Cleanup Drive', 'Annual beach cleanup event. We provide bags and grabbers. Just bring yourself!', 'Sunset Beach, Parking Lot B', '2026-04-19', '08:00', '', 25, 7, 5, 'UPCOMING'),
('Senior Home Visit', 'Spend time with seniors at the care facility. Activities include board games, reading, and conversation.', 'Golden Years Care Home, 500 Maple Dr', '2026-04-08', '10:00', '', 10, 3, 3, 'UPCOMING'),
('Web Design for Nonprofits', 'Help local nonprofits redesign their websites. React or basic HTML skills helpful.', 'Tech Hub Coworking, Suite 300', '2026-04-15', '13:00', 'React', 6, 1, 6, 'UPCOMING'),
('First Aid Training Day', 'Free first aid and CPR certification training for volunteers.', 'Fire Station #7, 800 Safety Blvd', '2026-04-22', '09:30', 'First Aid', 20, 5, 4, 'UPCOMING'),
('Food Drive & Meal Prep', 'Sort donated food and prepare meals for families in need.', 'Community Kitchen, 150 Hope St', '2026-04-10', '11:00', 'Cooking', 12, 8, 5, 'UPCOMING'),
('Habitat Build Day', 'Help construct affordable housing. Construction skills are a plus but not required.', 'Lot 42, Newtown Development', '2026-04-26', '07:00', 'Construction', 20, 3, 8, 'UPCOMING'),
('Park Trail Restoration', 'Previous month trail restoration event. Cleared paths and planted wildflowers.', 'Greenwood State Park, Trail 5', '2026-03-15', '08:00', '', 15, 15, 6, 'COMPLETED'),
('Holiday Toy Drive', 'Collected and wrapped over 500 toys for families in need last holiday season.', 'Community Center, 300 Unity Ave', '2025-12-20', '10:00', '', 20, 20, 4, 'COMPLETED');

-- Registrations (link some volunteers to events)
INSERT IGNORE INTO registrations (volunteer_id, event_id) VALUES
(1, 2), -- Sarah → Coding Workshop
(1, 4), -- Sarah → Senior Home Visit
(2, 5), -- Marcus → Web Design
(2, 1), -- Marcus → Garden Cleanup
(3, 6), -- Priya → First Aid Training
(3, 4), -- Priya → Senior Home Visit
(3, 9), -- Priya → Park Trail (completed)
(4, 8), -- Alex → Habitat Build
(4, 1), -- Alex → Garden Cleanup
(5, 7), -- Emily → Food Drive
(5, 4), -- Emily → Senior Home Visit
(5, 10); -- Emily → Toy Drive (completed)

-- Chat messages (demo conversations)
INSERT IGNORE INTO messages (sender_id, sender_name, event_id, recipient_id, content, sent_at) VALUES
(2, 'Marcus Johnson', 1, NULL, 'Hey everyone! Should I bring any specific tools for the garden cleanup?', '2026-03-25 14:30:00'),
(4, 'Alex Rivera', 1, NULL, 'Good question! I''ll bring some extra shovels and rakes.', '2026-03-25 14:45:00'),
(1, 'Sarah Chen', 2, NULL, 'Looking forward to teaching the kids! Anyone done this before?', '2026-03-26 10:00:00'),
(3, 'Priya Patel', 4, NULL, 'The seniors love board games — I''ll bring Scrabble and cards!', '2026-03-26 11:15:00'),
(5, 'Emily Wong', 4, NULL, 'Great idea Priya! I''ll bring some homemade cookies too 🍪', '2026-03-26 11:30:00'),
(5, 'Emily Wong', 7, NULL, 'We need more volunteers for meal prep! Please spread the word.', '2026-03-27 09:00:00');
