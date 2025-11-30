let peer = null;
let conn = null;
let fileData = null;
let fileName = null;

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('createRoomBtn').disabled = false;
        fileData = file;
        fileName = file.name;
    }
});

document.getElementById('createRoomBtn').addEventListener('click', () => {
    const peerId = Math.random().toString(36).substr(2, 9);
    peer = new Peer(peerId);

    peer.on('open', (id) => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
        document.getElementById('shareLink').value = shareUrl;
        document.getElementById('roomInfo').style.display = 'block';
        document.getElementById('createRoomBtn').style.display = 'none';
    });

    peer.on('connection', (connection) => {
        conn = connection;
        conn.on('open', () => {
            // Send file metadata first
            conn.send(JSON.stringify({ name: fileName, size: fileData.size }));

            // Send file data
            const reader = new FileReader();
            reader.onload = () => {
                conn.send(reader.result);
            };
            reader.readAsArrayBuffer(fileData);
        });
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Connection error: ' + err.message);
    });
});

document.getElementById('connectBtn').addEventListener('click', () => {
    const peerId = document.getElementById('roomIdInput').value.trim();
    if (!peerId) {
        alert('Please enter a room ID');
        return;
    }

    peer = new Peer();

    peer.on('open', () => {
        conn = peer.connect(peerId);

        conn.on('open', () => {
            console.log('Connected to peer');
        });

        conn.on('data', (data) => {
            if (typeof data === 'string') {
                // Metadata
                const meta = JSON.parse(data);
                fileName = meta.name;
            } else {
                // File data
                const blob = new Blob([data]);
                const url = URL.createObjectURL(blob);
                const link = document.getElementById('downloadLink');
                link.href = url;
                link.download = fileName;
                link.textContent = `Download ${fileName}`;
                document.getElementById('downloadArea').style.display = 'block';
                document.getElementById('connectBtn').style.display = 'none';
            }
        });
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Connection error: ' + err.message);
    });
});

// Check URL for room ID
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');
if (roomId) {
    document.getElementById('roomIdInput').value = roomId;
}

function copyLink() {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}