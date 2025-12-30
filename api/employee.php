<?php
// employee.php
require_once __DIR__ . '/connection-pdo.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Minimal placeholder endpoint.
try {
    $stmt = $conn->query('SELECT 1 as ok');
    echo json_encode(['success' => true, 'message' => 'Employee endpoint ready']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Employee endpoint error']);
}
