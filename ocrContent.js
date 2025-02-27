class OCRSelector {
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
            background: rgba(145, 217, 248, 0.1);
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

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const devicePixelRatio = window.devicePixelRatio;

        const x = Math.min(this.startX, this.currentX);
        const y = Math.min(this.startY, this.currentY);
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);

        // Get the actual coordinates relative to the page
        const actualX = x + scrollX;
        const actualY = y + scrollY;

        try {
            this.selectionBox.style.display = 'none';
            this.overlay.style.display = 'none';

            chrome.runtime.sendMessage({
                action: 'captureOCRArea',
                area: {
                    x: Math.round(actualX),
                    y: Math.round(actualY),
                    width: Math.round(width),
                    height: Math.round(height),
                    scrollX: scrollX,
                    scrollY: scrollY,
                    devicePixelRatio: devicePixelRatio
                }
            });
        } catch (error) {
            console.error('Error requesting OCR capture:', error);
            chrome.runtime.sendMessage({
                action: 'ocrResult',
                text: 'Error capturing area for OCR'
            });
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
    if (message.action === 'startOCRSelection') {
        new OCRSelector().initialize();
    } else if (message.action === 'removeSelection') {
        // Handle removal of selection overlay if needed
    }
});