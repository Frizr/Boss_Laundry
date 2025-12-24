-- ========================================
-- Boss Laundry POS - Database Setup
-- Complete SQL untuk setup database baru
-- ========================================

-- Buat database (jika belum ada)
CREATE DATABASE IF NOT EXISTS laundrypos_database;
USE laundrypos_database;

-- ========================================
-- Tabel USERS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Tabel SERVICES
-- ========================================
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default services
INSERT INTO services (name, price, unit, description) VALUES
('Wash & Fold', 5000.00, 'kg', 'Cuci dan lipat per kilogram'),
('Dry Cleaning', 10000.00, 'item', 'Dry clean per item'),
('Ironing', 3000.00, 'item', 'Setrika saja per item')
ON DUPLICATE KEY UPDATE name=name;

-- ========================================
-- Tabel ORDERS
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cashier_id INT,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    service_id INT,
    weight_quantity DECIMAL(10,2),
    price DECIMAL(10,2) NOT NULL,
    estimated_completion DATETIME,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    is_paid TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Tabel PAYMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method ENUM('CASH', 'TRANSFER', 'EWALLET') DEFAULT 'CASH',
    amount_paid DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    change_amount DECIMAL(10, 2) DEFAULT 0.00,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_paid_at (paid_at),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Insert Admin User (password: admin123)
-- ========================================
INSERT INTO users (username, password, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bosslaundry.com')
ON DUPLICATE KEY UPDATE username=username;

-- ========================================
-- Selesai!
-- ========================================
SELECT 'Database setup completed!' AS status;
SELECT 'Default login: admin / admin123' AS info;
