-- database.sql
-- Create DB + users table and insert admin/admin123

CREATE DATABASE IF NOT EXISTS dbpayroll;
USE dbpayroll;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('Admin'), ('HR'), ('Employee')
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);

INSERT INTO departments (name) VALUES
  ('Management / Executive'),
  ('Administrative & Finance'),
  ('Mine Safety & Environment'),
  ('Mine Management'),
  ('Geosciences')
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  UNIQUE KEY uniq_department_position (department_id, name),
  CONSTRAINT fk_positions_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Seed sample positions
INSERT INTO positions (department_id, name)
SELECT d.id, p.name
FROM departments d
JOIN (
  SELECT 'Management / Executive' AS dept, 'OIC Regional Director' AS name UNION ALL
  SELECT 'Management / Executive', 'Administrative Assistant I' UNION ALL
  SELECT 'Management / Executive', 'Science Research Specialist II' UNION ALL

  SELECT 'Administrative & Finance', 'Administrative Assistant I' UNION ALL
  SELECT 'Administrative & Finance', 'Administrative Assistant II' UNION ALL
  SELECT 'Administrative & Finance', 'Administrative Assistant III' UNION ALL
  SELECT 'Administrative & Finance', 'Accounting Clerk' UNION ALL
  SELECT 'Administrative & Finance', 'HR Officer' UNION ALL

  SELECT 'Mine Safety & Environment', 'Community Affairs Officer II' UNION ALL
  SELECT 'Mine Safety & Environment', 'Engineer' UNION ALL
  SELECT 'Mine Safety & Environment', 'Senior Science Research Specialist' UNION ALL

  SELECT 'Mine Management', 'Engineer' UNION ALL
  SELECT 'Mine Management', 'Engineer V' UNION ALL
  SELECT 'Mine Management', 'Cartographer II' UNION ALL

  SELECT 'Geosciences', 'Geologic Aide' UNION ALL
  SELECT 'Geosciences', 'Cartographer II' UNION ALL
  SELECT 'Geosciences', 'Geologist'
) p ON p.dept = d.name
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(30) NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  gender VARCHAR(20) NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  division_code VARCHAR(20) NOT NULL,
  position_id INT NOT NULL,
  role_id INT NOT NULL,
  chief ENUM('Yes','No') NOT NULL DEFAULT 'No',
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  date_hired DATE NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id)
);

-- Plain password for initial demo login (login.php supports plain or hashed).
INSERT INTO users (username, password, role_id)
VALUES (
  'admin',
  'admin123',
  (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role_id = VALUES(role_id);
