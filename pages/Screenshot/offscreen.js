chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cropImage') {
        cropImage(message.imageDataUrl, message.area)
            .then(croppedImageDataUrl => {
                chrome.runtime.sendMessage({
                    action: 'downloadCroppedImage',
                    dataUrl: croppedImageDataUrl
                });
            });
        return true;
    }
});

async function cropImage(imageDataUrl, area) {
    const img = new Image();
    return new Promise((resolve) => {
        img.onload = () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            // Set the canvas dimensions to match the cropped area
            canvas.width = area.width;
            canvas.height = area.height;

            // Ensure smooth image scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Calculate the actual dimensions
            const actualWidth = area.width / area.devicePixelRatio;
            const actualHeight = area.height / area.devicePixelRatio;

            ctx.drawImage(
                img,
                area.x, area.y,           // Source x, y
                area.width, area.height,  // Source width, height
                0, 0,                     // Destination x, y
                actualWidth, actualHeight // Destination width, height
            );

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imageDataUrl;
    });
}