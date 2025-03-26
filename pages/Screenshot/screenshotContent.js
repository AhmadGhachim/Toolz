
(function() {
    class ScreenshotManager {
        constructor() {
            this.originalStyles = new Map();
            this.canvas = null;
            this.ctx = null;
            this.captureInProgress = false;
        }

        async verifyScrollability() {
            const initialScroll = window.scrollY;
            window.scrollTo(0, initialScroll + 1);
            await new Promise(resolve => setTimeout(resolve, 50));
            const newScroll = window.scrollY;
            window.scrollTo(0, initialScroll);

            return newScroll !== initialScroll;
        }

        handleStickyElements() {
            const elements = document.querySelectorAll('*');

            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'sticky') {
                    this.originalStyles.set(el, {
                        position: el.style.position,
                        top: el.style.top,
                        zIndex: el.style.zIndex,
                        transform: el.style.transform,
                        transition: el.style.transition
                    });

                    const rect = el.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    el.style.position = 'absolute';
                    el.style.top = `${rect.top + scrollTop}px`;
                    el.style.transform = 'none';
                    el.style.transition = 'none';
                    el.style.zIndex = '1';
                }
            });
        }

        restoreStickyElements() {
            this.originalStyles.forEach((styles, element) => {
                Object.entries(styles).forEach(([property, value]) => {
                    element.style[property] = value;
                });
            });
            this.originalStyles.clear();
        }

        setupCanvas() {
            const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
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

        async captureSingleViewport() {
            const dataUrl = await new Promise(resolve => {
                chrome.runtime.sendMessage(
                    { action: "captureVisibleTab", from: "screenshot" },
                    resolve
                );
            });

            if (!dataUrl) {
                throw new Error('Failed to capture viewport');
            }

            return dataUrl;
        }

        async captureFullPage() {
            if (this.captureInProgress) {
                return;
            }

            try {
                this.captureInProgress = true;

                const isScrollable = await this.verifyScrollability();
                if (!isScrollable) {
                    const singleViewport = await this.captureSingleViewport();
                    await this.sendScreenshot(singleViewport);
                    return;
                }

                // Setup phase
                this.setupCanvas();
                this.handleStickyElements();

                // Store original scroll position
                const originalScroll = window.scrollY;
                const viewportHeight = window.innerHeight;
                let capturedHeight = 0;
                const totalHeight = this.canvas.height;

                // Capture phase
                while (capturedHeight < totalHeight) {
                    window.scrollTo(0, capturedHeight);
                    await new Promise(resolve => setTimeout(resolve, 150));

                    const remaining = totalHeight - capturedHeight;
                    const scrollStep = Math.min(
                        Math.floor(viewportHeight * 0.95),
                        remaining
                    );

                    const dataUrl = await this.captureSingleViewport();

                    // Draw to canvas
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = dataUrl;
                    });

                    this.ctx.drawImage(img, 0, capturedHeight);
                    capturedHeight += scrollStep;

                    // Handle final partial scroll
                    if (remaining < viewportHeight && capturedHeight >= totalHeight) {
                        window.scrollTo(0, totalHeight - viewportHeight);
                        await new Promise(resolve => setTimeout(resolve, 150));
                        const finalDataUrl = await this.captureSingleViewport();
                        const finalImg = await new Promise((resolve, reject) => {
                            const image = new Image();
                            image.onload = () => resolve(image);
                            image.onerror = reject;
                            image.src = finalDataUrl;
                        });
                        this.ctx.drawImage(finalImg, 0, totalHeight - viewportHeight);
                    }
                }

                // Cleanup and restore
                window.scrollTo(0, originalScroll);
                this.restoreStickyElements();

                // Generate and send final image
                const finalImage = await new Promise(resolve =>
                    this.canvas.toBlob(resolve, 'image/png')
                );

                const finalDataUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(finalImage);
                });

                await this.sendScreenshot(finalDataUrl);

            } catch (error) {
                console.error('Screenshot capture error:', error);
                chrome.runtime.sendMessage({
                    action: "handleError",
                    message: "Failed to capture screenshot: " + error.message
                });
            } finally {
                this.captureInProgress = false;
            }
        }

        async sendScreenshot(dataUrl) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: "screenshotCompleted",
                    dataUrl: dataUrl,
                    timestamp: Date.now()
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                });
            });
        }
    }


    if (window.scrollingScreenshotRequested) {
        const manager = new ScreenshotManager();
        manager.captureFullPage().catch(error => {
            console.error('Screenshot capture failed:', error);
            chrome.runtime.sendMessage({
                action: "handleError",
                message: "Screenshot capture failed: " + error.message
            });
        });
        window.scrollingScreenshotRequested = false;
    }
})();