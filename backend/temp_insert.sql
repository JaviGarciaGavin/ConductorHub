INSERT INTO user (email, password, name, roles, created_at, updated_at) 
VALUES (
    'admin@conductorhub.com', 
    '\\\\\\\\\', 
    'Administrador', 
    '[\"ROLE_SUPER_ADMIN\", \"ROLE_USER\"]', 
    NOW(), 
    NOW()
)
