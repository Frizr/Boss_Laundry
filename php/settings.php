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

$user_id = $_SESSION['user_id'];

// Handle GET request - Load user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Use 'id' column (not 'user_id') based on login.php
    $query = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt === false) {
        echo json_encode([
            'success' => false, 
            'message' => 'SQL error: ' . $conn->error,
            'user_id' => $user_id
        ]);
        exit;
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user_data = $result->fetch_assoc();
    
    if (!$user_data) {
        echo json_encode(['success' => false, 'message' => 'User not found', 'user_id' => $user_id]);
        exit;
    }
    
    // Remove password from response for security
    unset($user_data['password']);
    
    echo json_encode([
        'success' => true,
        'user' => $user_data
    ]);
    
    $stmt->close();
    exit;
}

// Handle POST request - Update user profile
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }
    
    // Update password if provided
    if (isset($data['password']) && !empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password minimal 6 karakter']);
            exit;
        }
        
        $password = password_hash($data['password'], PASSWORD_BCRYPT);
        $query = "UPDATE users SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'SQL error: ' . $conn->error]);
            exit;
        }
        
        $stmt->bind_param("si", $password, $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update password']);
        }
        exit;
    }
    
    echo json_encode(['success' => true, 'message' => 'No changes made']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request method']);
