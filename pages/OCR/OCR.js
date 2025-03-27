import config from '../../config.js';

class OCRProcessor {
    #apiKey;
    #currentFile;
    #elements;

    constructor() {
        this.#apiKey = config.OCR_KEY;
        this.#currentFile = null;
        this.#initializeElements();
        this.#initializeEventListeners();
    }

    #initializeElements() {
        this.#elements = {
            fileInput: document.getElementById('fileInput'),
            dropZone: document.getElementById('dropZone'),
            extractButton: document.getElementById('extract-button'),
            outputText: document.getElementById('extracted-text'),
            copyIcon: document.getElementById('copy-icon'),
            uploadContent: document.querySelector('.ocr__upload-content')
        };
    }

    #initializeEventListeners() {
        const { fileInput, dropZone, extractButton, copyIcon } = this.#elements;

        fileInput.addEventListener('change', (e) => this.#handleFileSelect(e));
        dropZone.addEventListener('click', () => fileInput.click());
        extractButton.addEventListener('click', () => this.#extractText());
        copyIcon.addEventListener('click', () => this.#copyToClipboard());

        // Add drag and drop support
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.#handleFile(file);
        });
    }

    #handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.#handleFile(file);
        }
    }

    #handleFile(file) {
        const { extractButton, outputText, uploadContent } = this.#elements;

        if (!file.type.startsWith('image/')) {
            this.#showError('Please select an image file.');
            return;
        }

        this.#currentFile = file;
        extractButton.disabled = false;
        outputText.value = '';

        uploadContent.innerHTML = `
            <p style="color: #72C2E0;">✓ ${file.name}</p>
            <p style="font-size: 0.8rem;">Click to upload a different image</p>
        `;
    }

    #showError(message) {
        const { outputText } = this.#elements;
        outputText.value = `Error: ${message}`;
    }

    async #extractText() {
        const { extractButton, outputText } = this.#elements;

        if (!this.#currentFile) {
            this.#showError('Please select an image first.');
            return;
        }

        extractButton.disabled = true;
        outputText.value = 'Processing...';

        try {
            const result = await this.#performOCR();
            this.#handleOCRResult(result);
        } catch (error) {
            this.#showError(error.message);
        } finally {
            extractButton.disabled = false;
        }
    }

    async #performOCR() {
        const formData = new FormData();
        formData.append('apikey', this.#apiKey);
        formData.append('file', this.#currentFile);
        formData.append('language', 'eng');
        formData.append('OCREngine', '2');

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    }

    #handleOCRResult(result) {
        const { outputText } = this.#elements;

        if (result.OCRExitCode === 1 && result.ParsedResults?.[0]?.ParsedText) {
            outputText.value = result.ParsedResults[0].ParsedText;
        } else {
            this.#showError('Could not extract text from image.');
        }
    }

    async #copyToClipboard() {
        const { copyIcon, outputText } = this.#elements;

        if (!outputText.value) {
            this.#showError('No text to copy.');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);
            this.#showCopyAnimation(copyIcon);
        } catch (error) {
            this.#showError('Failed to copy text to clipboard.');
        }
    }

    #showCopyAnimation(element) {
        element.style.opacity = '0.5';
        setTimeout(() => element.style.opacity = '1', 200);
    }
}

// Initialize the OCR processor when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OCRProcessor();
});