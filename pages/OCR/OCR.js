class OCRTool {
    constructor() {
        this.initializeElements();
        this.addEventListeners();
        this.worker = null;
        this.initializeWorker();
    }

    async initializeWorker() {
        this.worker = await Tesseract.createWorker({
            logger: message => {
                console.log(message);
                this.updateLoadingStatus(message);
            }
        });
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
    }

    initializeElements() {
        this.captureBtn = document.querySelector('.ocr__button--capture');
        this.uploadBtn = document.querySelector('.ocr__button--upload');
        this.resultArea = document.querySelector('.ocr__result');
        this.textArea = document.querySelector('.ocr__text');
        this.copyBtn = document.querySelector('.ocr__action-button--copy');
        this.clearBtn = document.querySelector('.ocr__action-button--clear');

        // Create loading overlay
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'ocr__loading hidden';
        this.loadingOverlay.textContent = 'Processing...';
        document.querySelector('.ocr__container').appendChild(this.loadingOverlay);
    }

    addEventListeners() {
        this.captureBtn.addEventListener('click', () => this.captureScreen());
        this.uploadBtn.addEventListener('click', () => this.uploadImage());
        this.copyBtn.addEventListener('click', () => this.copyText());
        this.clearBtn.addEventListener('click', () => this.clearText());
    }

    updateLoadingStatus(message) {
        if (message.status === 'recognizing text') {
            const progress = Math.round(message.progress * 100);
            this.loadingOverlay.textContent = `Processing... ${progress}%`;
        }
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    async captureScreen() {
        window.close();
        chrome.runtime.sendMessage({
            action: 'captureForOCR'
        });
    }

    uploadImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.processImage(file);
            }
        };
        input.click();
    }

    async processImage(imageSource) {
        try {
            this.showLoading();
            const { data: { text } } = await this.worker.recognize(imageSource);
            this.displayResult(text);
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Error processing image. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayResult(text) {
        this.resultArea.classList.remove('hidden');
        this.textArea.value = text;
    }

    async copyText() {
        try {
            await navigator.clipboard.writeText(this.textArea.value);
            this.copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyBtn.textContent = 'Copy Text';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    clearText() {
        this.textArea.value = '';
        this.resultArea.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OCRTool();
});