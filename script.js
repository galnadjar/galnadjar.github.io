const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const dropZone = document.getElementById('dropZone');
const filePreview = document.getElementById('filePreview');
const previewImg = document.getElementById('previewImg');
const fileName = document.getElementById('fileName');
const homeBtn = document.getElementById('homeBtn');

let selectedFile = null;

homeBtn.addEventListener('click', () => {
    selectedFile = null;
    hidePreview();
    resetOutput();
    fileInput.value = '';
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        selectedFile = fileInput.files[0];
        showPreview();
        processFile();
    } else {
        selectedFile = null;
        hidePreview();
        resetOutput();
    }
});

// Drag and drop functionality
dropZone.addEventListener('click', () => {
    dropZone.classList.add('clicked');
    setTimeout(() => dropZone.classList.remove('clicked'), 100);
    fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        dropZone.classList.add('clicked');
        setTimeout(() => dropZone.classList.remove('clicked'), 100);
        selectedFile = files[0];
        showPreview();
        processFile();
    } else {
        alert('Please drop a valid image file.');
    }
});

function showPreview() {
    const url = URL.createObjectURL(selectedFile);
    previewImg.src = url;
    fileName.textContent = selectedFile.name;
    filePreview.style.display = 'block';
    // Hide the upload icon and text when preview is shown
    dropZone.querySelector('.upload-icon').style.display = 'none';
    dropZone.querySelector('p').style.display = 'none';
}

function hidePreview() {
    filePreview.style.display = 'none';
    previewImg.src = '';
    fileName.textContent = '';
    // Show the upload icon and text
    dropZone.querySelector('.upload-icon').style.display = 'block';
    dropZone.querySelector('p').style.display = 'block';
}

async function processFile() {
    if (!selectedFile) return;

    try {
        // Show original size
        const originalSize = (selectedFile.size / 1024 / 1024).toFixed(2);
        output.innerHTML = `<p>Original size: ${originalSize} MB</p><p>Compressing...</p>`;

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.7
        };

        const compressedFile = await imageCompression(selectedFile, options);

        // Create download link
        const url = URL.createObjectURL(compressedFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_${selectedFile.name}`;
        link.textContent = 'Download Compressed Image';
        link.style.display = 'inline-block';
        link.style.marginTop = '10px';

        // Show file sizes
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
        output.innerHTML = `<p>Original: ${originalSize} MB | Compressed: ${compressedSize} MB</p>`;
        output.appendChild(link);

    } catch (error) {
        console.error(error);
        output.innerHTML = '<p>Error compressing image. Please try again.</p>';
    }
}

function resetOutput() {
    output.innerHTML = '';
}