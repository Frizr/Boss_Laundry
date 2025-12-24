<?php
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'laundrypos_database';

// Suppress error output - will be handled by JSON responses
error_reporting(E_ALL);
ini_set('display_errors', 0);

$conn = new mysqli($host, $user, $password, $dbname);

mysqli_set_charset($conn, "utf8mb4");

if ($conn->connect_error) {
    // Don't use die() - it breaks JSON APIs
    // The calling file should check $conn->connect_error
    $conn = null;
}
