// order.js - FINAL (Create Order + Load Orders Table + Pay Button + Filter)
document.addEventListener("DOMContentLoaded", function () {

  // ===== Sidebar toggle (mobile) =====
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.createElement("button");
  toggleBtn.className =
    "btn btn-primary d-lg-none position-fixed top-0 end-0 m-2";
  toggleBtn.style.zIndex = "9999";
  toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
  document.body.appendChild(toggleBtn);

  document.addEventListener("click", (e) => {
    if (
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target) &&
      window.innerWidth < 992
    ) {
      sidebar.classList.remove("show");
    }
  });

  // ===== Elements =====
  const orderForm = document.getElementById("orderForm");
  const ordersTableBody = document.getElementById("ordersTableBody");
  const statusFilter = document.getElementById("statusFilter");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

  // ===== Helpers =====
  function showAlert(message, type) {
    const existingAlert = document.querySelector(".alert-dismissible");
    if (existingAlert) existingAlert.remove();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    orderForm.insertAdjacentElement("afterend", alertDiv);

    setTimeout(() => {
      if (alertDiv) alertDiv.remove();
    }, 5000);
  }

  function formatRupiah(num) {
    const n = Number(num || 0);
    return `Rp ${n.toLocaleString("id-ID")}`;
  }

  function normalizeStatus(order) {
    let st = (order.status || "").toString().toLowerCase().trim();
    if (String(order.is_paid) === "1") st = "paid";
    return st || "pending";
  }

  function statusBadgeHtml(st) {
    if (st === "paid")
      return `<span class="badge-status badge-paid">paid</span>`;
    if (st === "completed")
      return `<span class="badge-status badge-completed">completed</span>`;
    if (st === "in progress")
      return `<span class="badge-status badge-progress">in progress</span>`;
    return `<span class="badge-status badge-pending">pending</span>`;
  }

  // ===== Load Orders =====
  async function loadOrders() {
    try {
      ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-muted">Loading...</td></tr>`;

      const res = await fetch('php/order.php', { method: 'GET' });
      const raw = await res.text();
      console.log('RAW response order.php:', raw);

      let json;
      try {
        json = JSON.parse(raw);
      } catch (e) {
        throw new Error('Response bukan JSON. Kemungkinan kena redirect login / ada warning PHP.');
      }

      if (!json.success) throw new Error(json.message || 'Gagal load orders');

      let orders = Array.isArray(json.data) ? json.data : [];

      // Apply filter if selected
      const filterValue = statusFilter ? statusFilter.value.toLowerCase() : "";
      if (filterValue) {
        orders = orders.filter(order => {
          const st = normalizeStatus(order);
          return st === filterValue;
        });
      }

      if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-muted">Tidak ada data order.</td></tr>`;
        return;
      }

      // Sort by order_date descending
      orders.sort((a, b) => {
        const da = new Date(a.order_date || 0);
        const db = new Date(b.order_date || 0);
        return db - da;
      });

      ordersTableBody.innerHTML = '';
      orders.forEach(order => {
        const st = normalizeStatus(order);
        const tr = document.createElement('tr');
        
        let actionHtml = '';
        if (st === 'paid') {
          actionHtml = `<span class="text-success fw-semibold">Paid</span>`;
        } else {
          actionHtml = `<a class="btn btn-sm btn-primary" href="payment.html?order_id=${encodeURIComponent(order.order_id)}">Pay</a>`;
        }

        tr.innerHTML = `
          <td><strong>#ORD${order.order_id}</strong></td>
          <td>${order.customer_name || '-'}</td>
          <td>${statusBadgeHtml(st)}</td>
          <td>${order.order_date || '-'}</td>
          <td><strong>${formatRupiah(order.price)}</strong></td>
          <td>${actionHtml}</td>
        `;
        ordersTableBody.appendChild(tr);
      });

    } catch (err) {
      console.error('loadOrders error:', err);
      ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger">${err.message}</td></tr>`;
      alert('Gagal memuat Order List: ' + err.message);
    }
  }

  // ===== Create Order (AJAX) =====
  if (orderForm) {
    orderForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const cashier_id = document.getElementById("customerSelect").value;
      const customer_name = document.getElementById("customerName").value.trim();
      const phone_number = document.getElementById("phoneNumber").value.trim();
      const service_id = document.getElementById("serviceSelect").value;
      const weight_quantity = document.getElementById("weightQuantity").value;
      const price = document.getElementById("price").value;
      const estimated_completion = document.getElementById("estimatedCompletion").value;

      if (
        !cashier_id ||
        !customer_name ||
        !phone_number ||
        !service_id ||
        !weight_quantity ||
        !price ||
        !estimated_completion
      ) {
        showAlert("Please fill in all fields.", "danger");
        return;
      }

      const submitBtn = orderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const formData = new FormData(orderForm);

        const resp = await fetch("php/order.php", {
          method: "POST",
          body: formData,
        });

        const text = await resp.text();

        if (text.includes("Order successfully created!")) {
          showAlert("Order berhasil dibuat!", "success");
          orderForm.reset();
          await loadOrders(); // refresh tabel
        } else {
          showAlert("Terjadi kesalahan: " + text, "danger");
        }
      } catch (error) {
        console.error("create order error:", error);
        showAlert("Terjadi kesalahan, coba lagi!", "danger");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // ===== Events =====
  if (statusFilter) statusFilter.addEventListener("change", loadOrders);
  if (refreshOrdersBtn) refreshOrdersBtn.addEventListener("click", loadOrders);

  // ===== Initial load =====
  loadOrders();
});
