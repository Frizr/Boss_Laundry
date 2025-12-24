// Payment.js - Integrated with Backend API
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.createElement("button");
  toggleBtn.className =
    "btn btn-primary d-lg-none position-absolute top-0 end-0 m-2";
  toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
  document.body.appendChild(toggleBtn);

  // Mobile sidebar close on click outside
  document.addEventListener("click", (e) => {
    if (
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target) &&
      window.innerWidth < 992
    ) {
      sidebar.classList.remove("show");
    }
  });

  // Payment Elements
  const amountInput = document.getElementById("amount");
  const changeDisplay = document.getElementById("change");
  const transactionTime = document.getElementById("transactionTime");
  const completePaymentBtn = document.getElementById("completePayment");
  const printReceiptBtn = document.getElementById("printReceipt");

  // Display elements
  const orderIdDisplay = document.getElementById("orderIdDisplay");
  const subtotalDisplay = document.getElementById("subtotalDisplay");
  const discountDisplay = document.getElementById("discountDisplay");
  const totalDisplay = document.getElementById("totalDisplay");

  // Get payment buttons
  const paymentMethodBtns = document.querySelectorAll(".btn-group button");
  let selectedPaymentMethod = "CASH"; // backend ENUM: CASH/TRANSFER/EWALLET
  let currentOrderId = null;
  let subtotal = 0;
  let discount = 0;
  let total = 0;

  // Set initial transaction time
  function updateTransactionTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      hour12: false,
    };
    transactionTime.textContent = `Transaction Time: ${now
      .toLocaleString("id-ID", options)
      .replace("WIB", "")} WIB`;
  }
  updateTransactionTime();
  setInterval(updateTransactionTime, 60000);

  // Payment Method Selection
  paymentMethodBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      paymentMethodBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const label = this.textContent.trim().toLowerCase();
      if (label.includes("cash")) selectedPaymentMethod = "CASH";
      else if (label.includes("transfer")) selectedPaymentMethod = "TRANSFER";
      else selectedPaymentMethod = "EWALLET";
    });
  });

  // Helper function format Rupiah
  function formatRupiah(num) {
    return `RP ${Number(num || 0).toLocaleString("id-ID")}`;
  }

  // Update display values
  function updateDisplayValues() {
    if (orderIdDisplay) orderIdDisplay.textContent = `Order: #ORD${currentOrderId}`;
    if (subtotalDisplay) subtotalDisplay.textContent = formatRupiah(subtotal);
    if (discountDisplay) discountDisplay.textContent = formatRupiah(discount);
    if (totalDisplay) totalDisplay.textContent = formatRupiah(total);
  }

  // Calculate change
  amountInput.addEventListener("input", function () {
    const amount = parseFloat(this.value) || 0;
    const change = amount - total;
    changeDisplay.textContent = formatRupiah(change >= 0 ? change : 0);
  });

  // Complete Payment Button
  completePaymentBtn.addEventListener("click", async function () {
    const amount = parseFloat(amountInput.value) || 0;

    if (!currentOrderId) {
      alert("Order ID tidak valid!");
      return;
    }

    if (amount < total) {
      alert("Jumlah pembayaran harus sama atau lebih besar dari total!");
      return;
    }

    const change = amount - total;

    // Prepare payment data
    const paymentData = {
      order_id: currentOrderId,
      method: selectedPaymentMethod,
      total_amount: total,
      amount_paid: amount,
    };

    try {
      // Send payment to backend
      const response = await fetch("php/payment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✓ Pembayaran berhasil!\n\nOrder ID: #ORD${currentOrderId}\nTotal: ${formatRupiah(total)}\nBayar: ${formatRupiah(amount)}\nKembali: ${formatRupiah(change)}\n\nWaktu: ${new Date().toLocaleString("id-ID")}`
        );

        // Redirect to orders page after successful payment
        setTimeout(() => {
          window.location.href = "order.html";
        }, 1500);
      } else {
        alert("Gagal memproses pembayaran: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat memproses pembayaran!");
    }
  });

  // Print Receipt Button
  printReceiptBtn.addEventListener("click", function () {
    const amount = parseFloat(amountInput.value) || 0;
    const change = amount - total;

    const receiptWindow = window.open("", "", "width=300,height=400");
    receiptWindow.document.write(`
            <html>
            <head>
                <title>Receipt - Laundry POS</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; }
                    h2 { text-align: center; margin-bottom: 10px; }
                    hr { border: 1px dashed #333; }
                    .row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { font-weight: bold; font-size: 1.2em; }
                </style>
            </head>
            <body>
                <h2>BOSS LAUNDRY</h2>
                <hr>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString("id-ID")}</p>
                <p><strong>Order ID:</strong> #ORD${currentOrderId}</p>
                <hr>
                <div class="row"><span>Subtotal:</span><span>${formatRupiah(subtotal)}</span></div>
                <div class="row"><span>Discount:</span><span>${formatRupiah(discount)}</span></div>
                <div class="row total"><span>Total:</span><span>${formatRupiah(total)}</span></div>
                <hr>
                <div class="row"><span>Paid:</span><span>${formatRupiah(amount)}</span></div>
                <div class="row"><span>Change:</span><span>${formatRupiah(change)}</span></div>
                <div class="row"><span>Method:</span><span>${selectedPaymentMethod}</span></div>
                <hr>
                <p style="text-align: center; margin-top: 20px;">Terima kasih!</p>
                <p style="text-align: center; font-size: 0.9em;">www.bosslaundry.com</p>
            </body>
            </html>
        `);
    receiptWindow.document.close();
    receiptWindow.print();
  });

  // Load order data from URL parameter if exists
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("order_id")) {
    alert("Order ID tidak ditemukan. Silakan pilih order dari halaman Orders.");
    window.location.href = "order.html";
    return;
  }

  currentOrderId = parseInt(urlParams.get("order_id"));
  loadOrderData(currentOrderId);

  // Function to load order data
  async function loadOrderData(orderId) {
    try {
      const response = await fetch(`php/payment.php?order_id=${orderId}`);
      const raw = await response.text();
      console.log('RAW payment.php response:', raw);

      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        throw new Error('Response bukan JSON. Kemungkinan session expired.');
      }

      if (result.success && result.data) {
        const order = result.data;
        subtotal = parseFloat(order.price) || 0;
        discount = 0; // bisa ditambahkan logic diskon di sini
        total = subtotal - discount;

        // Update display
        updateDisplayValues();

        console.log('Order loaded:', { orderId, subtotal, total });
      } else {
        alert("Order tidak ditemukan: " + (result.message || "Unknown error"));
        window.location.href = "order.html";
      }
    } catch (error) {
      console.error("Error loading order:", error);
      alert("Gagal memuat data order: " + error.message);
      window.location.href = "order.html";
    }
  }
});
