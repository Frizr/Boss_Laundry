<?php
session_start();
header('Content-Type: application/json');

// Suppress error output
error_reporting(E_ALL);
ini_set('display_errors', 0);

include '../includes/db.php';

// Check DB connection
if (!$conn || $conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$start_date = $_GET['start_date'] ?? null;
$end_date   = $_GET['end_date'] ?? null;

$sql = "
    SELECT p.payment_id, p.order_id, p.method, p.total_amount, p.amount_paid, p.change_amount, p.paid_at,
           o.customer_name
    FROM payments p
    JOIN orders o ON o.order_id = p.order_id
";

$where = [];
$params = [];
$types = "";

if ($start_date) {
    $where[] = "DATE(p.paid_at) >= ?";
    $params[] = $start_date;
    $types .= "s";
}
if ($end_date) {
    $where[] = "DATE(p.paid_at) <= ?";
    $params[] = $end_date;
    $types .= "s";
}

if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " ORDER BY p.paid_at DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    echo json_encode(['success' => false, 'message' => 'SQL prepare failed', 'error' => $conn->error]);
    exit;
}

if (count($params) > 0) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$res = $stmt->get_result();

$data = [];
$totalRevenue = 0;

while ($row = $res->fetch_assoc()) {
    $data[] = $row;
    $totalRevenue += (float)$row['total_amount'];
}

echo json_encode([
    'success' => true,
    'summary' => [
        'total_transactions' => count($data),
        'total_revenue' => $totalRevenue
    ],
    'data' => $data
]);

$stmt->close();
