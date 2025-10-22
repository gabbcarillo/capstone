 const uploadSection = document.getElementById("uploadSection");
    const productsSection = document.getElementById("products");
    const uploadTitle = document.getElementById("uploadTitle");
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const progressContainer = document.getElementById('progressContainer');
    let selectedProduct = ""; // store the product name


    // Show upload container for selected product
    function showUpload(productName) {
      selectedProduct = productName; // store selected product
      productsSection.style.display = "none";
      uploadSection.style.display = "block";
      uploadTitle.textContent = `Upload New Review Data for ${productName}`;
    }

    // Go back to product selection
    function goBack() {
      uploadSection.style.display = "none";
      productsSection.style.display = "block";
    }

    // Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0], selectedProduct);
});

// File input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileUpload(e.target.files[0], selectedProduct);
});


    function handleFileUpload(file, productName) {
      const fileItem = document.createElement('div');
      fileItem.classList.add('file-item');
      fileItem.innerHTML = `
      <div class="file-header">
        <div class="file-name">${file.name}</div>
        <button class="delete-btn" title="Delete file">✖</button>
      </div>
      <div class="progress-bar"><div class="progress"></div></div>
      <div class="status">Uploading...</div>
    `;
      progressContainer.appendChild(fileItem);

      const progressBar = fileItem.querySelector('.progress');
      const status = fileItem.querySelector('.status');
      const deleteBtn = fileItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => fileItem.remove());

      const formData = new FormData();
      formData.append("file", file);
      formData.append("product_name", productName);  // <-- send product name

      fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            progressBar.style.width = "100%";
            status.innerHTML = '<span style="color: green;">✔ Upload & pre-processing complete.</span>';
          } else {
            status.innerHTML = `<span style="color: red;">✖ ${data.message}</span>`;
          }
        })
        .catch(err => {
          console.error(err);
          status.innerHTML = '<span style="color: red;">✖ Upload failed.</span>';
        });
    }