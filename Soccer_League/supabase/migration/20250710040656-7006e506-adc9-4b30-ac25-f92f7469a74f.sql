-- First, update the admin_users table to link your email to your user_id
UPDATE admin_users 
SET user_id = auth.uid() 
WHERE email = 'rutikjagtap89@gmail.com' AND user_id IS NULL;

-- Update RLS policy to allow checking admin status by email for global admins
DROP POLICY "Users can view their admin status" ON admin_users;

CREATE POLICY "Users can view their admin status" ON admin_users
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND auth.email() = email)
);