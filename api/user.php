<?php
// user.php
// Supports:
// - GET  /api/user.php?type=employees  -> list employees
// - POST /api/user.php?type=employees  -> create employee
require_once __DIR__ . '/connection-pdo.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

function json_response($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function normalize_role_name($role) {
    $r = trim((string)$role);
    if ($r === '') return 'Employee';
    $rLower = strtolower($r);
    if ($rLower === 'admin') return 'Admin';
    if ($rLower === 'hr') return 'HR';
    if ($rLower === 'employee') return 'Employee';
    return 'Employee';
}

$type = isset($_GET['type']) ? $_GET['type'] : 'users';

try {
    // Ensure roles table exists + seed
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        )"
    );
    $conn->exec(
        "INSERT INTO roles (name) VALUES ('Admin'), ('HR'), ('Employee')
         ON DUPLICATE KEY UPDATE name = VALUES(name)"
    );

    // Ensure departments table exists + seed
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL UNIQUE
        )"
    );
    $conn->exec(
        "INSERT INTO departments (name) VALUES
          ('Management / Executive'),
          ('Administrative & Finance'),
          ('Mine Safety & Environment'),
          ('Mine Management'),
          ('Geosciences')
         ON DUPLICATE KEY UPDATE name = VALUES(name)"
    );

    // Ensure positions table exists + seed
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS positions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department_id INT NOT NULL,
            name VARCHAR(150) NOT NULL,
            UNIQUE KEY uniq_department_position (department_id, name),
            CONSTRAINT fk_positions_department FOREIGN KEY (department_id) REFERENCES departments(id)
        )"
    );
    // Seed positions (this is a simplified version; in production, use a loop or more robust seeding)
    $conn->exec(
        "INSERT INTO positions (department_id, name)
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
         ON DUPLICATE KEY UPDATE name = VALUES(name)"
    );

    if ($type === 'employees') {
        // Ensure employees table exists (matching database.sql)
        $conn->exec(
            "CREATE TABLE IF NOT EXISTS employees (
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
            )"
        );

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $conn->query(
                "SELECT e.id, e.employee_id, e.first_name, e.last_name, e.middle_name, e.gender, e.email,
                        d.name AS department, e.division_code, p.name AS position,
                        r.name AS role,
                        e.chief, e.status, e.date_hired, e.created_at
                 FROM employees e
                 LEFT JOIN roles r ON r.id = e.role_id
                 LEFT JOIN departments d ON d.id = e.department_id
                 LEFT JOIN positions p ON p.id = e.position_id
                 ORDER BY e.id DESC"
            );

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            json_response(['success' => true, 'data' => $rows]);
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $body = get_json_body();

            $firstName = trim($body['firstName'] ?? '');
            $lastName = trim($body['lastName'] ?? '');
            $middleName = trim($body['middleName'] ?? '');
            $gender = trim($body['gender'] ?? '');
            $email = trim($body['email'] ?? '');
            $department = trim($body['department'] ?? '');
            $divisionCode = trim($body['divisionCode'] ?? '');
            $position = trim($body['position'] ?? '');
            $chief = ($body['chief'] ?? 'No') === 'Yes' ? 'Yes' : 'No';
            $status = trim($body['status'] ?? 'Active');
            $dateHired = trim($body['dateHired'] ?? '');
            $password = (string)($body['password'] ?? '');

            $roleName = normalize_role_name($body['role'] ?? 'Employee');

            if ($firstName === '' || $lastName === '' || $email === '') {
                json_response(['success' => false, 'message' => 'Missing required fields'], 400);
            }

            // Auto-fill division_code based on department when not provided
            if ($divisionCode === '' && $department !== '') {
                $map = [
                    'Management / Executive' => 'ORD',
                    'Administrative & Finance' => 'FAD',
                    'Mine Safety & Environment' => 'MSESDD',
                    'Mine Management' => 'MMD',
                    'Geosciences' => 'GD',
                ];
                if (isset($map[$department])) {
                    $divisionCode = $map[$department];
                }
            }

            // Defaults so NOT NULL columns won't fail
            if ($department === '') $department = 'N/A';
            if ($divisionCode === '') $divisionCode = 'N/A';
            if ($position === '') $position = 'N/A';

            // Basic status validation
            if ($status !== 'Active' && $status !== 'Inactive') {
                $status = 'Active';
            }

            // Convert dateHired to YYYY-MM-DD or NULL
            $dateHiredDb = null;
            if ($dateHired !== '') {
                $ts = strtotime($dateHired);
                if ($ts !== false) {
                    $dateHiredDb = date('Y-m-d', $ts);
                }
            }

            $passwordHash = null;
            if ($password !== '') {
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            }

            // Resolve role_id
            $rStmt = $conn->prepare('SELECT id FROM roles WHERE name = ? LIMIT 1');
            $rStmt->execute([$roleName]);
            $roleRow = $rStmt->fetch(PDO::FETCH_ASSOC);
            $roleId = $roleRow ? (int)$roleRow['id'] : 0;
            if ($roleId <= 0) {
                json_response(['success' => false, 'message' => 'Server error'], 500);
            }

            // Resolve department_id
            $dStmt = $conn->prepare('SELECT id FROM departments WHERE name = ? LIMIT 1');
            $dStmt->execute([$department]);
            $deptRow = $dStmt->fetch(PDO::FETCH_ASSOC);
            $departmentId = $deptRow ? (int)$deptRow['id'] : 0;
            if ($departmentId <= 0) {
                json_response(['success' => false, 'message' => 'Invalid department'], 400);
            }

            // Resolve position_id
            $pStmt = $conn->prepare('SELECT id FROM positions WHERE name = ? AND department_id = ? LIMIT 1');
            $pStmt->execute([$position, $departmentId]);
            $posRow = $pStmt->fetch(PDO::FETCH_ASSOC);
            $positionId = $posRow ? (int)$posRow['id'] : 0;
            if ($positionId <= 0) {
                json_response(['success' => false, 'message' => 'Invalid position for department'], 400);
            }

            // Ensure users table exists with role_id
            $conn->exec(
                "CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
                )"
            );

            $conn->beginTransaction();

            // Insert employee
            $stmt = $conn->prepare(
                'INSERT INTO employees (employee_id, first_name, last_name, middle_name, gender, email, department_id, division_code, position_id, role_id, chief, status, date_hired, password_hash)
                 VALUES (:employee_id, :first_name, :last_name, :middle_name, :gender, :email, :department_id, :division_code, :position_id, :role_id, :chief, :status, :date_hired, :password_hash)'
            );

            $stmt->execute([
                ':employee_id' => $body['employeeId'] ?? null,
                ':first_name' => $firstName,
                ':last_name' => $lastName,
                ':middle_name' => $middleName !== '' ? $middleName : null,
                ':gender' => $gender !== '' ? $gender : null,
                ':email' => $email,
                ':department_id' => $departmentId,
                ':division_code' => $divisionCode,
                ':position_id' => $positionId,
                ':role_id' => $roleId,
                ':chief' => $chief,
                ':status' => $status,
                ':date_hired' => $dateHiredDb,
                ':password_hash' => $passwordHash,
            ]);

            $employeeRowId = $conn->lastInsertId();

            // Insert login user (username=email)
            $username = $email;
            $userPassword = $password !== '' ? $password : 'employee123';
            $userPasswordHash = password_hash($userPassword, PASSWORD_DEFAULT);

            $uStmt = $conn->prepare(
                'INSERT INTO users (username, password, role_id) VALUES (:username, :password, :role_id)'
            );
            $uStmt->execute([
                ':username' => $username,
                ':password' => $userPasswordHash,
                ':role_id' => $roleId,
            ]);

            $conn->commit();

            $rowStmt = $conn->prepare(
                "SELECT e.id, e.employee_id, e.first_name, e.last_name, e.middle_name, e.gender, e.email,
                        d.name AS department, e.division_code, p.name AS position,
                        r.name AS role,
                        e.chief, e.status, e.date_hired, e.created_at
                 FROM employees e
                 LEFT JOIN roles r ON r.id = e.role_id
                 LEFT JOIN departments d ON d.id = e.department_id
                 LEFT JOIN positions p ON p.id = e.position_id
                 WHERE e.id = :id"
            );
            $rowStmt->execute([':id' => $employeeRowId]);
            $row = $rowStmt->fetch(PDO::FETCH_ASSOC);

            json_response(['success' => true, 'data' => $row], 201);
        }

        json_response(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    // Default: list users (now with role join)
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        json_response(['success' => false, 'message' => 'Method not allowed'], 405);
    }

    // Ensure users table exists with role_id
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
        )"
    );

    $stmt = $conn->query(
        "SELECT u.id, u.username, r.name AS role, u.created_at
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
         ORDER BY u.id DESC"
    );
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['success' => true, 'data' => $users]);
} catch (PDOException $e) {
    // If we started a transaction and something failed
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }

    // Handle duplicate entries nicely
    if ((int)$e->getCode() === 23000) {
        json_response(['success' => false, 'message' => 'Email/Username already exists'], 409);
    }

    json_response(['success' => false, 'message' => 'Server error'], 500);
} catch (Exception $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    json_response(['success' => false, 'message' => 'Server error'], 500);
}
