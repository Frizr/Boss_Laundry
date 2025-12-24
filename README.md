# Boss Laundry POS

Sistem Point of Sale (POS) untuk bisnis laundry, dibangun dengan PHP + MySQL + HTML/JS.

## Screenshots

![Dashboard](assets/screenshot.png)

## Fitur

- ✅ **Dashboard** - Overview bisnis
- ✅ **Orders** - Buat dan kelola order laundry
- ✅ **Payments** - Proses pembayaran (Cash/Transfer/E-Wallet)
- ✅ **Reports** - Laporan transaksi dengan filter tanggal
- ✅ **Settings** - Update password user

## Teknologi

- **Backend**: PHP 7.4+
- **Database**: MySQL / MariaDB
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5

## Instalasi

### 1. Persiapan

- Install [XAMPP](https://www.apachefriends.org/) (PHP + MySQL)
- Atau gunakan server PHP + MySQL lainnya

### 2. Clone Repository

```bash
git clone https://github.com/USERNAME/Laundry_PoS.git
cd Laundry_PoS
```

### 3. Setup Database

1. Buka phpMyAdmin (`http://localhost/phpmyadmin`)
2. Import file `database_setup.sql`
   - Klik "Import" → Pilih file → Klik "Go"
3. Database `laundrypos_database` akan otomatis dibuat

### 4. Konfigurasi

Edit file `includes/db.php` jika kredensial database berbeda:

```php
$host = 'localhost';
$user = 'root';
$password = '';  // Sesuaikan jika ada password
$dbname = 'laundrypos_database';
```

### 5. Jalankan

1. Pindahkan folder project ke `htdocs` (XAMPP)
2. Buka browser: `http://localhost/Laundry_PoS/`
3. Login dengan:
   - **Username**: `admin`
   - **Password**: `admin123`

## Struktur Folder

```
Laundry_PoS/
├── css/                 # Stylesheet
├── js/                  # JavaScript files
│   ├── order.js
│   ├── payment.js
│   ├── reports.js
│   └── setting.js
├── php/                 # Backend API
│   ├── login.php
│   ├── order.php
│   ├── payment.php
│   ├── reports.php
│   └── settings.php
├── includes/
│   └── db.php          # Database connection
├── assets/             # Images, icons
├── database_setup.sql  # SQL untuk setup database
├── index.html          # Landing/Login page
├── dashboard.html
├── order.html
├── payment.html
├── reports.html
└── setting.html
```

## API Endpoints

| Endpoint            | Method   | Deskripsi                  |
| ------------------- | -------- | -------------------------- |
| `/php/login.php`    | POST     | Login user                 |
| `/php/order.php`    | GET      | List semua orders          |
| `/php/order.php`    | POST     | Buat order baru            |
| `/php/payment.php`  | GET      | Detail order untuk payment |
| `/php/payment.php`  | POST     | Proses pembayaran          |
| `/php/reports.php`  | GET      | Data laporan pembayaran    |
| `/php/settings.php` | GET/POST | Profile user               |

## License

MIT License

## Author

Boss Laundry Team
