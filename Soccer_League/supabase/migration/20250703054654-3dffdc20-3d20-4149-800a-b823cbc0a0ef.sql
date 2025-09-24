-- Add your email as a global admin
INSERT INTO admin_users (email, role, user_id) 
VALUES ('rutikjagtap89@gmail.com', 'admin', NULL)
ON CONFLICT (email) DO UPDATE SET role = 'admin';