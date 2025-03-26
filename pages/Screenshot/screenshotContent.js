(async function captureScrollingScreenshot() {
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const body = document.body;
        const html = document.documentElement;

        const totalHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
        const viewportHeight = window.innerHeight;

        canvas.width = window.innerWidth; // Match viewport width
        canvas.height = totalHeight; // Match total document height

        let scrollTop = 0;
        let isFinalScroll = false;

        while (!isFinalScroll) {
            // Calculate if the current scroll is the last one
            isFinalScroll = totalHeight - scrollTop <= viewportHeight;

            // Scroll to the current position
            window.scrollTo(0, scrollTop);
            await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure content is rendered

            // Capture the visible viewport
            const dataUrl = await new Promise((resolve) =>
                chrome.runtime.sendMessage({ action: "captureVisibleTab" }, resolve)
            );

            if (!dataUrl) throw new Error("Failed to capture visible tab");

            // Draw the captured viewport onto the canvas at the correct position
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, scrollTop);
                    resolve();
                };
                img.onerror = () => reject(new Error("Failed to load captured image"));
            });

            // Increment scroll position
            scrollTop += viewportHeight;
        }

        window.scrollTo(0, 0); // Reset scroll position to the top of the page

        // Export the canvas as an image
        const blobPromise = new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob));
        });

        const blob = await blobPromise;
        if (!blob) throw new Error("Failed to export canvas as an image");

        // Trigger download only once
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scrolling-screenshot-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        // Communicate errors to the user
        chrome.runtime.sendMessage({ action: "handleError", message: error.message });
    }
})();