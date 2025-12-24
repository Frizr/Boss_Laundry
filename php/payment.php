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

// Handle GET request - Get payment info for an order
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['order_id'])) {
        $order_id = intval($_GET['order_id']);

        // Ambil data order untuk pembayaran
        $query = "SELECT o.*, s.name AS service_name, s.price AS service_price
                  FROM orders o 
                  LEFT JOIN services s ON o.service_id = s.service_id 
                  WHERE o.order_id = ?";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'SQL prepare failed', 'error' => $conn->error]);
            exit;
        }
        
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $order = $result->fetch_assoc();
            echo json_encode(['success' => true, 'data' => $order]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
        }
        $stmt->close();
    } else {
        // Get all unpaid orders
        $query = "SELECT o.*, s.name AS service_name
          FROM orders o
          LEFT JOIN services s ON o.service_id = s.service_id
          WHERE o.status != 'paid'
          ORDER BY o.order_date DESC";

        $result = $conn->query($query);

        if ($result === false) {
            echo json_encode([
                'success' => false,
                'message' => 'SQL Error (GET unpaid orders)',
                'error' => $conn->error
            ]);
            exit;
        }

        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $orders]);
    }
    exit;
}

// Handle POST request - Process payment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $order_id = intval($data['order_id'] ?? 0);
    $method = $data['method'] ?? 'CASH';
    $amount_paid = floatval($data['amount_paid'] ?? 0);
    $total_amount = floatval($data['total_amount'] ?? 0);
    $change_amount = $amount_paid - $total_amount;
    $created_by = $_SESSION['user_id'];

    // Validasi
    if ($order_id <= 0 || $amount_paid <= 0 || $total_amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid payment data']);
        exit;
    }

    if ($amount_paid < $total_amount) {
        echo json_encode(['success' => false, 'message' => 'Amount paid is less than total']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert payment
        $query = "INSERT INTO payments (order_id, method, amount_paid, total_amount, change_amount, created_by)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception('SQL prepare failed: ' . $conn->error);
        }
        
        $stmt->bind_param(
            "isdddi",
            $order_id,
            $method,
            $amount_paid,
            $total_amount,
            $change_amount,
            $created_by
        );
        $stmt->execute();

        // Update order status
        $query = "UPDATE orders SET status = 'paid', is_paid = 1 WHERE order_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $order_id);
        $stmt->execute();

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Payment processed successfully',
            'change' => $change_amount
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Payment failed',
            'error' => $e->getMessage()
        ]);
    }

    exit;
}

// Default response for unknown request method
echo json_encode(['success' => false, 'message' => 'Invalid request method']);