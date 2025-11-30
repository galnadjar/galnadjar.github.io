document.getElementById('shareZone').addEventListener('dragover', (e) => {
    e.preventDefault();
    document.getElementById('shareZone').classList.add('dragover');
});

document.getElementById('shareZone').addEventListener('dragleave', () => {
    document.getElementById('shareZone').classList.remove('dragover');
});

let selectedFile = null;

document.getElementById('homeBtn').addEventListener('click', () => {
    // Reset the page
    selectedFile = null;
    const oldInput = document.getElementById('fileInput');
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.id = 'fileInput';
    newInput.accept = '*/*';
    newInput.style.display = 'none';
    newInput.addEventListener('change', handleFileChange);
    oldInput.parentNode.replaceChild(newInput, oldInput);
    document.querySelector('#shareZone p').textContent = 'Click to select a file to share (max 500KB)';
    document.getElementById('shareZone').style.display = 'block';
    const btn = document.getElementById('createLinkBtn');
    btn.disabled = true;
    btn.style.display = 'block';
    btn.style.margin = '20px auto 0';
    btn.style.background = '#ccc';
    btn.style.color = '#666';
    btn.style.cursor = 'not-allowed';
    document.getElementById('output').style.display = 'none';
    document.getElementById('output').innerHTML = '';
    // Clear URL hash
    window.history.replaceState(null, null, window.location.pathname);
});

document.getElementById('shareZone').addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById('shareZone').classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        console.log('File dropped:', file.name, 'Size:', file.size);
        if (file && file.size < 500 * 1024) { // 500KB limit
            console.log('File accepted');
            selectedFile = file;
            const btn = document.getElementById('createLinkBtn');
            btn.disabled = false;
            btn.style.background = 'linear-gradient(135deg, #bd93f9, #8b5cf6)';
            btn.style.color = '#282a36';
            btn.style.cursor = 'pointer';
            document.querySelector('#shareZone p').textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        } else {
            console.log('File rejected');
            selectedFile = null;
            const btn = document.getElementById('createLinkBtn');
            btn.disabled = true;
            btn.style.background = '#ccc';
            btn.style.color = '#666';
            btn.style.cursor = 'not-allowed';
            alert('File too large (max 500KB)');
        }
    }
});

function handleFileChange(e) {
    const file = e.target.files[0];
    console.log('File input change event fired');
    console.log('File selected:', file ? file.name : 'none', 'Size:', file ? file.size : 'N/A');
    if (file && file.size < 500 * 1024) { // 500KB limit
        console.log('File accepted, enabling button');
        selectedFile = file;
        const btn = document.getElementById('createLinkBtn');
        btn.disabled = false;
        btn.style.background = 'linear-gradient(135deg, #bd93f9, #8b5cf6)';
        btn.style.color = '#282a36';
        btn.style.cursor = 'pointer';
        document.querySelector('#shareZone p').textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    } else {
        console.log('File rejected or no file');
        selectedFile = null;
        const btn = document.getElementById('createLinkBtn');
        btn.disabled = true;
        btn.style.background = '#ccc';
        btn.style.color = '#666';
        btn.style.cursor = 'not-allowed';
        if (file) {
            alert('File too large (max 500KB). File size: ' + (file.size / 1024).toFixed(1) + 'KB');
        }
    }
}

document.getElementById('fileInput').addEventListener('change', handleFileChange);

document.getElementById('createLinkBtn').addEventListener('click', () => {
    console.log('Create link button clicked');
    const file = selectedFile;
    console.log('File for link:', file);
    if (!file) {
        alert('No file selected');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data: prefix
        const hash = `data=${encodeURIComponent(base64)};name=${encodeURIComponent(file.name)}`;
        const shareUrl = `${window.location.origin}${window.location.pathname}#${hash}`;
        const output = document.getElementById('output');
        output.innerHTML = `
            <p>Share link created!</p>
            <textarea id="shareLink" readonly style="width: 100%; padding: 0.75rem; background: #282a36; color: #f8f2f4; border: 1px solid #6272a4; border-radius: 0.3125rem; margin: 0.625rem 0; font-size: 0.875rem; resize: none;">${shareUrl}</textarea>
            <button onclick="copyLink()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #bd93f9, #8b5cf6); color: #282a36; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; margin-top: 0.625rem;">Copy Link</button>
        `;
        output.style.display = 'block';
        document.getElementById('createLinkBtn').style.display = 'none';
        document.getElementById('shareZone').style.display = 'none';
    };
    reader.readAsDataURL(file);
});

// Check for hash on load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('data=')) {
        const parts = hash.split(';');
        const dataPart = parts.find(p => p.startsWith('data='));
        const namePart = parts.find(p => p.startsWith('name='));
        if (dataPart && namePart) {
            const base64 = decodeURIComponent(dataPart.split('=')[1]);
            const name = decodeURIComponent(namePart.split('=')[1]);
            const mimeType = getMimeType(name);
            // Create blob for better mobile download support
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            const output = document.getElementById('output');
            output.innerHTML = `
                <p>File: ${name}</p>
                <a id="downloadLink" href="${blobUrl}" target="_blank">View/Download File</a>
                <p style="font-size: 0.75rem; color: #f8f2f4; margin-top: 0.5rem;">Click the link to view the file. On iOS, you can save it by tapping the share button in the browser.</p>
            `;
            output.style.display = 'block';
            document.getElementById('shareZone').style.display = 'none';
        }
    }
});

function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'txt': 'text/plain',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'json': 'application/json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

function copyLink() {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}