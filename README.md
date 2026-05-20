# Laundry POS System 🧺💻

![Dashboard Mockup](file:///C:/Users/afrizal/.gemini/antigravity/brain/ad86d78a-4936-4bc6-85a3-3929063f86f6/laundry_pos_dashboard_1779289880831.png)

---

## 📖 Project Overview

**Laundry POS** is a lightweight, PHP‑based point‑of‑sale web application for managing a laundry business. It provides a clean, responsive UI built with vanilla HTML, CSS, and JavaScript, and a backend powered by PHP and MySQL. The system handles user authentication, order creation, payment processing, reporting, and settings configuration.

> **Note:** This repository contains the **PHP + HTML/CSS/JS** implementation. It is distinct from the earlier Java/JSP version of the same business logic.

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| **User Authentication** | Secure login & registration with password hashing. |
| **Order Management** | Create, view, edit, and delete laundry orders. |
| **Payment Processing** | Inline payment page with real‑time total calculation. |
| **Reporting Dashboard** | Summary cards for total orders, pending payments, and recent activity. |
| **Settings** | Manage shop information, pricing tiers, and admin credentials. |
| **Responsive Design** | Works on desktops, tablets, and mobile devices. |
| **Internationalisation Ready** | PHPMailer configured for UTF‑8 (SMTPUTF8) support. |

---

## 🏗️ Architecture

The application follows a classic **Model‑View‑Controller (MVC)**‑like separation, though without a full framework:

- **`php/`** – Core PHP scripts (database connection, helper functions, PHPMailer integration). 
- **`includes/`** – Reusable UI fragments (`header.php`, `footer.php`, navigation sidebar). 
- **`assets/`** – Static assets such as images, fonts, and icons. 
- **`css/`** – Stylesheets leveraging modern CSS techniques (Flexbox, CSS Grid, custom properties). 
- **`js/`** – Client‑side JavaScript for form validation, dynamic UI updates, and AJAX calls. 
- **HTML pages** – High‑level views (`dashboard.html`, `order.html`, `payment.html`, `reports.html`, etc.) that pull in the PHP includes.

### Data Flow
1. **Client** requests a page → PHP renders the view with data from MySQL. 
2. **Form submissions** (e.g., new order) POST to a PHP endpoint which validates input, updates the database, and redirects back. 
3. **Emails** (order confirmations, receipts) are sent via PHPMailer, automatically handling UTF‑8 addresses via `SMTPUTF8` when needed.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (custom design, no frameworks), vanilla JavaScript (ES6+).
- **Backend:** PHP 8.x, MySQL 5.7+, Composer for dependency management.
- **Mail:** PHPMailer (supports UTF‑8, SMTPUTF8).
- **Version Control:** Git.

---

## 🚀 Getting Started

### Prerequisites

1. **Web server** with PHP 8.x (e.g., Apache, Nginx, XAMPP, WAMP).
2. **MySQL** database server.
3. **Composer** installed globally.
4. **Node.js** (optional, only if you want to run a local dev server for static assets).

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/laundry-pos.git
cd laundry-pos

# Install PHP dependencies (PHPMailer, etc.)
composer install

# Create a MySQL database
# (replace <db_name>, <user>, <password> with your own values)
mysql -u root -p -e "CREATE DATABASE laundry_pos;"

# Import the schema (provided in docs/schema.sql)
mysql -u root -p laundry_pos < docs/schema.sql
```

### Configuration

Copy the example config and edit the credentials:

```bash
cp php/config.example.php php/config.php
```

Edit `php/config.php`:
```php
<?php
return [
    'db_host' => 'localhost',
    'db_name' => 'laundry_pos',
    'db_user' => 'your_mysql_user',
    'db_pass' => 'your_mysql_password',
    // Mail settings
    'mail_host' => 'smtp.example.com',
    'mail_username' => 'you@example.com',
    'mail_password' => 'your_smtp_password',
    'mail_port' => 587,
    'mail_encryption' => 'tls',
];
?>
```

### Running the Application

Place the project in your web server’s document root (e.g., `htdocs` for XAMPP) and navigate to:
```
http://localhost/laundry-pos/dashboard.html
```
You should see the sleek dashboard mockup and be able to log in using the credentials seeded in the database (admin / `admin123`).

---

## 📸 Screenshots

| Page | Screenshot |
|------|------------|
| **Dashboard** | ![Dashboard](file:///C:/Users/afrizal/.gemini/antigravity/brain/ad86d78a-4936-4bc6-85a3-3929063f86f6/laundry_pos_dashboard_1779289880831.png) |
| **Order List** | *(Add a screenshot of `order.html` here)* |
| **Payment** | *(Add a screenshot of `payment.html` here)* |

*(Replace the placeholders with actual screenshots if available.)*

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/awesome-feature`.
3. Commit your changes with clear messages.
4. Push to your fork and open a Pull Request.

Please adhere to the existing coding style and run the linter (`composer lint`) before submitting.

---

## 📄 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## 👨‍💻 Author

**Afrizal** – *Full‑stack web developer*  
[GitHub Profile](https://github.com/Frizr)  
Email: `afrizalrizky000@gmail.com`

---

*Happy coding! 🎉*
