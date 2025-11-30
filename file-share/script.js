document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.size < 10 * 1024 * 1024) { // 10MB limit
        document.getElementById('createLinkBtn').disabled = false;
    } else {
        alert('File too large (max 10MB)');
    }
});

document.getElementById('createLinkBtn').addEventListener('click', () => {
    const file = document.getElementById('fileInput').files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data: prefix
        const hash = `data=${encodeURIComponent(base64)};name=${encodeURIComponent(file.name)}`;
        const shareUrl = `${window.location.origin}${window.location.pathname}#${hash}`;
        document.getElementById('shareLink').value = shareUrl;
        document.getElementById('linkInfo').style.display = 'block';
        document.getElementById('createLinkBtn').style.display = 'none';
    };
    reader.readAsDataURL(file);
});

// Check for hash on load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('data=')) {
        const params = new URLSearchParams(hash);
        const base64 = params.get('data');
        const name = params.get('name');
        if (base64 && name) {
            document.querySelector('.share-section').style.display = 'none';
            document.getElementById('receiveSection').style.display = 'block';
            document.getElementById('fileInfo').textContent = `File: ${name}`;

            const mimeType = getMimeType(name);
            const dataUrl = `data:${mimeType};base64,${base64}`;
            const link = document.getElementById('downloadLink');
            link.href = dataUrl;
            link.download = name;
            link.textContent = `Download ${name}`;
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