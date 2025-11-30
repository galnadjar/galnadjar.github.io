document.getElementById('shareZone').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.style.display = 'none';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.size < 500 * 1024) {
            selectedFile = file;
            const btn = document.getElementById('createLinkBtn');
            btn.disabled = false;
            btn.style.background = 'linear-gradient(135deg, #bd93f9, #8b5cf6)';
            btn.style.color = '#282a36';
            btn.style.cursor = 'pointer';
            document.querySelector('#shareZone p').textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        } else {
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
        document.body.removeChild(input);
    });
    document.body.appendChild(input);
    input.click();
});

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
        document.getElementById('shareLink').value = shareUrl;
        const output = document.getElementById('output');
        output.innerHTML = `
            <p>Share link created!</p>
            <input type="text" id="shareLink" value="${shareUrl}" readonly style="width: 100%; padding: 12px; background: #282a36; color: #f8f2f4; border: 1px solid #6272a4; border-radius: 5px; margin: 10px 0; font-size: 14px;">
            <button onclick="copyLink()" style="padding: 12px 24px; background: linear-gradient(135deg, #bd93f9, #8b5cf6); color: #282a36; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 10px;">Copy Link</button>
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
            const dataUrl = `data:${mimeType};base64,${base64}`;
            const output = document.getElementById('output');
            output.innerHTML = `
                <p>File: ${name}</p>
                <a id="downloadLink" href="${dataUrl}" download="${name}">Download File</a>
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