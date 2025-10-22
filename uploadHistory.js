console.log("✅ uploadHistory.js loaded");

function loadUploadHistory() {
  fetch("http://127.0.0.1:5000/uploaded_files")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#uploadTable tbody");
      tbody.innerHTML = "";
      data.forEach(file => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${file.product}</td>
          <td>${file.filename}</td>
          <td>${file.upload_date}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error("Error loading history:", err));
}

// ✅ Filter dropdown handler (if you still use it)
document.getElementById("productFilter").addEventListener("change", e => {
  const selected = e.target.value;
  document.querySelectorAll("#uploadTable tbody tr").forEach(row => {
    const product = row.cells[0].innerText;
    row.style.display = selected === "All" || product === selected ? "" : "none";
  });
});

// ✅ Load data when page finishes loading
window.onload = loadUploadHistory;
