import config from '../../config.js';

class OCRProcessor {
    constructor() {
        this.apiKey = config.OCR_KEY;
        this.fileInput = document.getElementById('fileInput');
        this.dropZone = document.getElementById('dropZone');
        this.extractButton = document.getElementById('extract-button');
        this.outputText = document.getElementById('extracted-text');
        this.copyIcon = document.getElementById('copy-icon');
        this.currentFile = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.style.borderColor = '#72C2E0';
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.style.borderColor = '';
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });

        // Click to upload
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Extract text
        this.extractButton.addEventListener('click', () => this.extractText());

        // Copy text
        this.copyIcon.addEventListener('click', () => this.copyToClipboard());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            this.currentFile = file;
            this.extractButton.disabled = false;
            this.outputText.value = '';
        }
    }

    async extractText() {
        if (!this.currentFile) return;

        this.extractButton.disabled = true;
        this.outputText.value = 'Processing...';

        const formData = new FormData();
        formData.append('apikey', this.apiKey);
        formData.append('file', this.currentFile);
        formData.append('language', 'eng');
        formData.append('OCREngine', '2');

        try {
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.OCRExitCode === 1 && result.ParsedResults) {
                this.outputText.value = result.ParsedResults[0].ParsedText;
            } else {
                this.outputText.value = 'Error: Could not extract text from image.';
            }
        } catch (error) {
            this.outputText.value = `Error: ${error.message}`;
        } finally {
            this.extractButton.disabled = false;
        }
    }

    copyToClipboard() {
        navigator.clipboard.writeText(this.outputText.value)
            .then(() => {
                this.copyIcon.style.opacity = '0.5';
                setTimeout(() => this.copyIcon.style.opacity = '1', 200);
            })
            .catch(err => console.error('Failed to copy text:', err));
    }
}

// Initialize the OCR processor when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OCRProcessor();
});