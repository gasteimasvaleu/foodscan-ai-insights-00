-- Insert admin role for caiorobbb@gmail.com
INSERT INTO user_roles (user_id, role)
VALUES ('81418d5b-66b0-404c-8394-7b3398c7f0d8', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;