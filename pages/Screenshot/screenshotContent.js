// screenshotContent.js
(function() {
    class ScreenshotManager {
        constructor() {
            this.originalStyles = new Map();
            this.canvas = null;
            this.ctx = null;
        }

        handleStickyElements() {
            // Store and modify sticky/fixed elements
            const elements = document.querySelectorAll('*');

            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'sticky') {
                    this.originalStyles.set(el, {
                        position: el.style.position,
                        top: el.style.top,
                        zIndex: el.style.zIndex
                    });

                    // Convert to absolute positioning during capture
                    el.style.position = 'absolute';
                    el.style.top = style.top;
                    el.style.zIndex = '1';
                }
            });
        }

        restoreStickyElements() {
            // Restore original styles
            this.originalStyles.forEach((styles, element) => {
                element.style.position = styles.position;
                element.style.top = styles.top;
                element.style.zIndex = styles.zIndex;
            });
            this.originalStyles.clear();
        }

        setupCanvas() {
            const viewportWidth = window.innerWidth;
            const totalHeight = Math.max(
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight,
                document.body.scrollHeight,
                document.body.offsetHeight
            );

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = viewportWidth;
            this.canvas.height = totalHeight;
        }

        async captureFullPage() {
            try {
                // 1. Setup phase
                this.setupCanvas();
                this.handleStickyElements();

                // 2. Capture phase
                const viewportHeight = window.innerHeight;
                let capturedHeight = 0;
                const scrollStep = Math.floor(viewportHeight * 0.95); // 95% overlap for smooth transition

                // Store original scroll position
                const originalScroll = window.scrollY;

                while (capturedHeight < this.canvas.height) {
                    // Scroll to position
                    window.scrollTo(0, capturedHeight);

                    // Wait for scroll and repaint
                    await new Promise(resolve => setTimeout(resolve, 150));

                    // Capture current viewport
                    const dataUrl = await new Promise(resolve => {
                        chrome.runtime.sendMessage(
                            { action: "captureVisibleTab", from: "screenshot" },
                            resolve
                        );
                    });

                    if (!dataUrl) {
                        throw new Error('Failed to capture viewport');
                    }

                    // Draw to canvas
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = dataUrl;
                    });

                    this.ctx.drawImage(img, 0, capturedHeight);
                    capturedHeight += scrollStep;
                }

                // 3. Cleanup phase
                window.scrollTo(0, originalScroll);
                this.restoreStickyElements();

                // 4. Generate final image
                const blob = await new Promise(resolve =>
                    this.canvas.toBlob(resolve, 'image/png')
                );

                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `full-page-screenshot-${Date.now()}.png`;
                link.click();

                // Cleanup
                URL.revokeObjectURL(url);

            } catch (error) {
                console.error('Screenshot error:', error);
                chrome.runtime.sendMessage({
                    action: "handleError",
                    message: "Screenshot failed: " + error.message
                });
                this.restoreStickyElements();
            }
        }
    }

    // Initialize and start capture when requested
    if (window.scrollingScreenshotRequested) {
        const screenshotManager = new ScreenshotManager();
        screenshotManager.captureFullPage();
        delete window.scrollingScreenshotRequested;
    }
})();