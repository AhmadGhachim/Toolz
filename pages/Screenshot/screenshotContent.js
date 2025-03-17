console.log('Screenshot content script loaded');

class ScreenshotSelector {
    constructor() {
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.selectionBox = null;
        this.overlay = null;

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    initialize() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            cursor: crosshair;
            z-index: 999999;
        `;

        this.selectionBox = document.createElement('div');
        this.selectionBox.style.cssText = `
            position: fixed;
            border: 2px solid #ffffff;
            background: rgba(0, 123, 255, 0.1);
            pointer-events: none;
            z-index: 1000000;
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.selectionBox);

        this.overlay.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        document.body.style.userSelect = 'none';
    }

    handleMouseDown(e) {
        this.isSelecting = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.updateSelectionBox();
    }

    handleMouseMove(e) {
        if (!this.isSelecting) return;

        this.currentX = e.clientX;
        this.currentY = e.clientY;
        this.updateSelectionBox();
    }

    async handleMouseUp() {
        if (!this.isSelecting) return;
        this.isSelecting = false;

        // Get scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Get device pixel ratio
        const devicePixelRatio = window.devicePixelRatio;

        const x = Math.min(this.startX, this.currentX);
        const y = Math.min(this.startY, this.currentY);
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);

        try {
            this.selectionBox.style.display = 'none';
            this.overlay.style.display = 'none';

            chrome.runtime.sendMessage({
                action: 'captureSelectedArea',
                area: {
                    x: (x + scrollX) * devicePixelRatio,
                    y: (y + scrollY) * devicePixelRatio,
                    width: width * devicePixelRatio,
                    height: height * devicePixelRatio,
                    devicePixelRatio
                }
            });
        } catch (error) {
            console.error('Error requesting screenshot capture:', error);
        }

        this.cleanup();
    }

    updateSelectionBox() {
        const x = Math.min(this.startX, this.currentX);
        const y = Math.min(this.startY, this.currentY);
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);

        this.selectionBox.style.left = x + 'px';
        this.selectionBox.style.top = y + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
        this.selectionBox.style.display = 'block';
    }

    cleanup() {
        if (this.overlay) this.overlay.remove();
        if (this.selectionBox) this.selectionBox.remove();
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.body.style.userSelect = '';
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startSelection') {
        console.log('Starting selection process');
        const selector = new ScreenshotSelector();
        selector.initialize();
        sendResponse({ status: 'selection_started' });
        return true;
    } else if (message.action === 'removeSelection') {
        const overlay = document.querySelector('div[style*="position: fixed"][style*="background: rgba(0, 0, 0, 0.3)"]');
        const selectionBox = document.querySelector('div[style*="position: fixed"][style*="border: 2px solid #ffffff"]');

        if (overlay) overlay.remove();
        if (selectionBox) selectionBox.remove();

        sendResponse({ status: 'selection_removed' });
        return true;
    }
});