document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-primary d-lg-none position-absolute top-0 end-0 m-2';
    toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    document.body.appendChild(toggleBtn);

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 992) {
            sidebar.classList.remove('show');
        }
    });

    const transactionTime = document.getElementById('transactionTime');
    function updateTransactionTime() {
        if (!transactionTime) return;
        const now = new Date();
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
            hour12: false
        };
        transactionTime.textContent = `Last Updated: ${now.toLocaleString('id-ID', options).replace('WIB', '')} WIB`;
    }
    updateTransactionTime();
    setInterval(updateTransactionTime, 60000);

    // ======= ELEMENTS =======
    const saveSettingsBtn = document.getElementById('saveSettings');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Load current settings from backend
    async function loadSettings() {
        try {
            const response = await fetch('php/settings.php');
            const raw = await response.text();
            console.log('RAW settings.php response:', raw);

            let result;
            try {
                result = JSON.parse(raw);
            } catch (e) {
                console.error('JSON parse error:', e);
                alert('Gagal parse response dari server');
                return;
            }

            if (result.success && result.user) {
                // Load user data - use whatever fields are available
                if (usernameInput) usernameInput.value = result.user.username || result.user.name || '';
                if (emailInput) emailInput.value = result.user.email || '';
                
                console.log('Settings loaded:', result.user);
            } else {
                console.error('Failed to load settings:', result.message);
                alert('Gagal memuat pengaturan: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            alert('Gagal memuat pengaturan: ' + error.message);
        }
    }

    // Save settings to backend
    saveSettingsBtn.addEventListener('click', async function () {
        const password = passwordInput ? passwordInput.value : '';

        if (!password) {
            alert('Masukkan password baru untuk menyimpan perubahan');
            return;
        }
        
        if (password.length < 6) {
            alert('Password minimal 6 karakter!');
            return;
        }

        // Prepare data - only send password
        const settingsData = {
            password: password
        };

        try {
            saveSettingsBtn.disabled = true;
            saveSettingsBtn.textContent = 'Saving...';

            const response = await fetch('php/settings.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });

            const result = await response.json();

            if (result.success) {
                alert('✓ Password berhasil diperbarui!');
                if (passwordInput) passwordInput.value = '';
            } else {
                alert('Gagal menyimpan: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Terjadi kesalahan saat menyimpan!');
        } finally {
            saveSettingsBtn.disabled = false;
            saveSettingsBtn.textContent = 'Save Changes';
        }
    });

    // Load settings on page load
    loadSettings();
});