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

// === GET: list orders ===
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT order_id, customer_name, status, order_date, price, is_paid
            FROM orders
            ORDER BY order_date DESC";
    $res = $conn->query($sql);

    if (!$res) {
        echo json_encode(['success' => false, 'message' => 'SQL Error', 'error' => $conn->error]);
        exit;
    }

    $orders = [];
    while ($row = $res->fetch_assoc()) {
        $orders[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $orders]);
    exit;
}

// === POST: create order ===
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $cashier_id = $_POST['cashier_id'] ?? 0;
    $customer_name = $_POST['customer_name'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $service_id = $_POST['service_id'] ?? 0;
    $weight_quantity = $_POST['weight_quantity'] ?? 0;
    $price = $_POST['price'] ?? 0;
    $estimated_completion = $_POST['estimated_completion'] ?? null;
    $status = 'pending';

    // Validation
    if (!$customer_name || !$phone_number || !$service_id || !$price) {
        echo "Error: Missing required fields";
        exit;
    }

    $query = "INSERT INTO orders (user_id, cashier_id, customer_name, phone_number, service_id, weight_quantity, price, estimated_completion, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        echo "Error: " . $conn->error;
        exit;
    }
    
    $stmt->bind_param("iissiddss", $user_id, $cashier_id, $customer_name, $phone_number, $service_id, $weight_quantity, $price, $estimated_completion, $status);

    if ($stmt->execute()) {
        $orderId = $stmt->insert_id;
        echo "Order successfully created! Order ID: $orderId";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request method']);
