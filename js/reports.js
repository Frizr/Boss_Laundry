document.addEventListener("DOMContentLoaded", function () {
  // ======= Sidebar toggle =======
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.createElement("button");
  toggleBtn.className =
    "btn btn-primary d-lg-none position-absolute top-0 end-0 m-2";
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

  // ======= Transaction Time =======
  const transactionTime = document.getElementById("transactionTime");
  function updateTransactionTime() {
    if (!transactionTime) return;
    const now = new Date();
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    transactionTime.textContent =
      "Report Generated: " + now.toLocaleDateString("id-ID", options);
  }
  updateTransactionTime();

  // ======= ELEMENTS =======
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const searchNameInput = document.getElementById("searchName");
  const filterBtn = document.getElementById("filterBtn");
  const exportBtn = document.getElementById("exportBtn");
  const tableBody = document.querySelector("table tbody");
  const totalTransactionsEl = document.getElementById("totalTransactions");
  const totalRevenueEl = document.getElementById("totalRevenue");

  // Store all reports for client-side filtering
  let allReports = [];

  // Helper function
  function formatRupiah(num) {
    return `Rp ${Number(num || 0).toLocaleString("id-ID")}`;
  }

  // Load reports from backend
  async function loadReports(filters = {}) {
    try {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

      // Build query params
      const params = new URLSearchParams();
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await fetch(`php/reports.php?${params.toString()}`);
      const raw = await response.text();
      console.log('RAW reports.php response:', raw);

      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        throw new Error('Response bukan JSON. Kemungkinan session expired.');
      }

      if (result.success) {
        allReports = result.data || [];
        
        // Update summary
        if (result.summary) {
          if (totalTransactionsEl) {
            totalTransactionsEl.textContent = result.summary.total_transactions || 0;
          }
          if (totalRevenueEl) {
            totalRevenueEl.textContent = formatRupiah(result.summary.total_revenue || 0);
          }
        }

        // Display with optional customer filter
        displayReports(allReports, filters.customer_name);
      } else {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${result.message || 'Gagal memuat data'}</td></tr>`;
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message}</td></tr>`;
    }
  }

  // Display reports in table (with optional client-side customer filter)
  function displayReports(reports, customerFilter = "") {
    tableBody.innerHTML = "";

    // Client-side filter by customer name
    let filtered = reports;
    if (customerFilter && customerFilter.trim()) {
      const search = customerFilter.toLowerCase().trim();
      filtered = reports.filter(r => 
        (r.customer_name || "").toLowerCase().includes(search)
      );
    }

    if (!filtered || filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
      return;
    }

    filtered.forEach((report) => {
      const row = document.createElement("tr");

      let formattedDate = "-";
      if (report.paid_at) {
        try {
          const date = new Date(report.paid_at);
          formattedDate = date.toISOString().split("T")[0];
        } catch (e) {
          formattedDate = report.paid_at;
        }
      }

      row.innerHTML = `
            <td>${formattedDate}</td>
            <td>#ORD${report.order_id}</td>
            <td>${report.customer_name || '-'}</td>
            <td>${report.method || '-'}</td>
            <td>${formatRupiah(report.total_amount)}</td>
            <td><span class="badge bg-success">Paid</span></td>
        `;

      tableBody.appendChild(row);
    });
  }

  // Apply filter
  function applyFilter() {
    const filters = {
      start_date: startDateInput ? startDateInput.value : null,
      end_date: endDateInput ? endDateInput.value : null,
      customer_name: searchNameInput ? searchNameInput.value.trim() : null,
    };

    loadReports(filters);
  }

  // Export to CSV
  function exportToCSV() {
    if (!allReports || allReports.length === 0) {
      alert("Tidak ada data untuk di-export!");
      return;
    }

    // Create CSV content
    const headers = ["Date", "Order ID", "Customer", "Method", "Amount", "Status"];
    const rows = allReports.map(r => [
      r.paid_at ? new Date(r.paid_at).toISOString().split("T")[0] : "-",
      `#ORD${r.order_id}`,
      r.customer_name || "-",
      r.method || "-",
      r.total_amount || 0,
      "Paid"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  // Event listeners
  if (filterBtn) filterBtn.addEventListener("click", applyFilter);
  if (exportBtn) exportBtn.addEventListener("click", exportToCSV);
  if (searchNameInput) {
    searchNameInput.addEventListener("input", () => {
      displayReports(allReports, searchNameInput.value);
    });
  }

  // Initial load
  loadReports();
});
