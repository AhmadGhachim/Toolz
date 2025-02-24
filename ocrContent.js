let isSelecting = false;
let startX, startY;
let selectionDiv;

function initializeSelection() {
    selectionDiv = document.createElement('div');
    selectionDiv.style.position = 'fixed';
    selectionDiv.style.border = '2px solid #00ff00';
    selectionDiv.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    selectionDiv.style.pointerEvents = 'none';
    selectionDiv.style.zIndex = '10000';
    document.body.appendChild(selectionDiv);

    document.addEventListener('mousedown', startSelection);
    document.addEventListener('mousemove', updateSelection);
    document.addEventListener('mouseup', endSelection);
}

function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    updateSelectionDiv(e);
}

function updateSelection(e) {
    if (!isSelecting) return;
    updateSelectionDiv(e);
}

function updateSelectionDiv(e) {
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionDiv.style.left = left + 'px';
    selectionDiv.style.top = top + 'px';
    selectionDiv.style.width = width + 'px';
    selectionDiv.style.height = height + 'px';
}

function endSelection(e) {
    if (!isSelecting) return;
    isSelecting = false;

    const bounds = selectionDiv.getBoundingClientRect();
    captureScreenshot(bounds);

    // Clean up
    document.body.removeChild(selectionDiv);
    document.removeEventListener('mousedown', startSelection);
    document.removeEventListener('mousemove', updateSelection);
    document.removeEventListener('mouseup', endSelection);
}

async function captureScreenshot(bounds) {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            preferCurrentTab: true,
            video: { mediaSource: "screen" }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, bounds.left, bounds.top, bounds.width, bounds.height,
            0, 0, bounds.width, bounds.height);

        stream.getTracks().forEach(track => track.stop());

        const imageData = canvas.toDataURL('image/png');
        chrome.runtime.sendMessage({ type: 'processOCR', imageData });

    } catch (error) {
        console.error('Screenshot failed:', error);
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startOCR') {
        initializeSelection();
    }
});
