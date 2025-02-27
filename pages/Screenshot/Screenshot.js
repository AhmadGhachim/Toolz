class ScreenshotTool {
    constructor() {
        this.initializeElements();
        this.addEventListeners();
    }

    initializeElements() {
        this.selectAreaBtn = document.querySelector('.screenshot__button--select');
        this.fullPageBtn = document.querySelector('.screenshot__button--full');
    }

    addEventListeners() {
        this.selectAreaBtn.addEventListener('click', () => this.captureArea());
        this.fullPageBtn.addEventListener('click', () => this.captureFullPage());
    }

    async captureArea() {
        window.close();
        chrome.runtime.sendMessage({
            action: 'captureArea'
        });
    }

    async captureFullPage() {
        window.close();
        chrome.runtime.sendMessage({
            action: 'captureFullPage'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotTool();
});