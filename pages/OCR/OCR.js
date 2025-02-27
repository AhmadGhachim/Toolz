document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-ocr');
    const outputTextarea = document.getElementById('ocr-output');
    const copyIcon = document.getElementById('copy-icon');
    const OCR_TIMEOUT = 30000; // 30 seconds timeout
    let timeoutId;

    // In OCR.js, modify the showLoading function to:
    function showLoading() {
        outputTextarea.value = "Extracting text from image...";
    }


    // Check for existing OCR state
    chrome.storage.local.get(['ocrState', 'ocrText'], ({ ocrState, ocrText }) => {
        if (ocrState === 'loading') {
            showLoading();
            // Set timeout for existing loading state
            startOCRTimeout();
        } else if (ocrText) {
            outputTextarea.value = ocrText;
        }
    });

    function startOCRTimeout() {
        timeoutId = setTimeout(async () => {
            clearLoading();
            outputTextarea.value = 'OCR process took too long. Please try again.';
            await chrome.storage.local.set({
                ocrState: 'error',
                ocrText: 'OCR process took too long. Please try again.'
            });
        }, OCR_TIMEOUT);
    }

    startButton.addEventListener('click', async () => {
        try {
            showLoading();
            startOCRTimeout();

            await chrome.storage.local.set({
                ocrState: 'loading',
                ocrText: ''
            });

            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['ocrContent.js']
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            await chrome.tabs.sendMessage(tab.id, { action: 'startOCRSelection' });

            window.close();
        } catch (error) {
            console.error('Error starting OCR:', error);
            clearLoading();
            outputTextarea.value = 'Error starting OCR. Please try again.';
            await chrome.storage.local.set({
                ocrState: 'error',
                ocrText: 'Error starting OCR. Please try again.'
            });
        }
    });

    copyIcon.addEventListener('click', () => {
        navigator.clipboard.writeText(outputTextarea.value);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'ocrResult') {
            clearLoading();
            outputTextarea.value = message.text;
            chrome.storage.local.set({
                ocrState: 'completed',
                ocrText: message.text
            });
        }
    });
});