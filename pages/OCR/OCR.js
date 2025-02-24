document.addEventListener('DOMContentLoaded', () => {
    // Only inject content script after we have the tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['ocrContent.js']
            });
        }
    });

    chrome.storage.local.get(['ocrResult', 'ocrError'], (result) => {
        if (result.ocrResult) {
            document.getElementById('ocr-output').value = result.ocrResult;
            chrome.storage.local.remove('ocrResult');
        }
        if (result.ocrError) {
            document.getElementById('ocr-output').value = `Error: ${result.ocrError}`;
            chrome.storage.local.remove('ocrError');
        }
    });

    document.getElementById('extract-text-button').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'startOCR' });
            window.close();
        });
    });
});