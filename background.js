// Timer-related variables and functions
let countdownInterval = null;
let totalSeconds = 0;

function saveTimerState() {
    chrome.storage.local.set({ totalSeconds }, () => {
        console.log(`Timer state saved: ${totalSeconds}s remaining`);
    });
}

function startCountdown(newSeconds = null) {
    if (countdownInterval) return;

    if (newSeconds !== null) totalSeconds = newSeconds;

    countdownInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds -= 1;
            saveTimerState();
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            chrome.storage.local.set({ completed: true });
        }
    }, 1000);
}

function pauseCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    totalSeconds = 0;
    chrome.storage.local.set({ totalSeconds });
}

// Message handler for different actions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Timer commands
    if (message.command === "start") {
        const newSeconds = message.totalSeconds || null;
        if (newSeconds !== null && !countdownInterval) {
            saveTimerState();
        }
        startCountdown(newSeconds);
        sendResponse({ status: "started" });
    } else if (message.command === "pause") {
        pauseCountdown();
        sendResponse({ status: "paused" });
    } else if (message.command === "reset") {
        resetCountdown();
        sendResponse({ status: "reset" });
    } else if (message.command === "getTime") {
        sendResponse({ totalSeconds });
    }

    // Screenshot and OCR actions
    if (message.action === 'captureArea') {
        handleAreaCapture();
        return true;
    } else if (message.action === 'captureFullPage') {
        handleFullPageCapture();
        return true;
    } else if (message.action === 'captureSelectedArea') {
        handleSelectedAreaCapture(message.area);
        return true;
    } else if (message.action === 'captureOCRArea') {
        handleOCRAreaCapture(message.area);
        return true;
    }
});

function downloadScreenshot(dataUrl, prefix = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.png`;

    chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true
    });
}

async function handleAreaCapture() {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab) {
            console.error('No active tab found');
            return;
        }

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['screenshotContent.js']
        });

        await chrome.tabs.sendMessage(tab.id, {
            action: 'startSelection'
        });

    } catch (error) {
        console.error('Error in area capture:', error);
    }
}

async function handleFullPageCapture() {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab) {
            console.error('No active tab found');
            return;
        }

        const capture = await chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        });

        downloadScreenshot(capture);

    } catch (error) {
        console.error('Error in full page capture:', error);
    }
}

async function handleSelectedAreaCapture(area) {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab) {
            console.error('No active tab found');
            return;
        }

        await chrome.tabs.sendMessage(tab.id, { action: 'removeSelection' });
        await new Promise(resolve => setTimeout(resolve, 100));

        const capture = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        cropAndDownloadImage(capture, area);

    } catch (error) {
        console.error('Error in selected area capture:', error);
    }
}

async function handleOCRAreaCapture(area) {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab) {
            console.error('No active tab found');
            return;
        }

        // Remove the selection overlay
        await chrome.tabs.sendMessage(tab.id, { action: 'removeSelection' });
        await new Promise(resolve => setTimeout(resolve, 100));

        const capture = await chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        });

        // Create canvas to crop the screenshot
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = async () => {
            // Set canvas dimensions based on device pixel ratio for better quality
            canvas.width = area.width * area.devicePixelRatio;
            canvas.height = area.height * area.devicePixelRatio;

            // Draw the image considering scroll position and device pixel ratio
            ctx.drawImage(
                img,
                (area.x + area.scrollX) * area.devicePixelRatio,
                (area.y + area.scrollY) * area.devicePixelRatio,
                area.width * area.devicePixelRatio,
                area.height * area.devicePixelRatio,
                0,
                0,
                area.width * area.devicePixelRatio,
                area.height * area.devicePixelRatio
            );

            const dataUrl = canvas.toDataURL();
            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            const { data: { text } } = await worker.recognize(dataUrl);
            await worker.terminate();

            chrome.runtime.sendMessage({
                action: 'ocrResult',
                text: text.trim()
            });
        };

        img.src = capture;

    } catch (error) {
        console.error('Error in OCR area capture:', error);
        chrome.runtime.sendMessage({
            action: 'ocrResult',
            text: 'Error performing OCR on the selected area'
        });
    }
}


function cropImage(imageUrl, area) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = area.width * area.devicePixelRatio;
            canvas.height = area.height * area.devicePixelRatio;

            ctx.drawImage(img,
                area.x * area.devicePixelRatio,
                area.y * area.devicePixelRatio,
                canvas.width,
                canvas.height,
                0, 0,
                canvas.width,
                canvas.height
            );

            resolve(canvas.toDataURL());
        };
        img.src = imageUrl;
    });
}

// Add your Gemini API key
const GEMINI_API_KEY = 'AIzaSyChmbtA0ZpyDhoRXXOTeU9r7L5f7tRBU5Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function processImageWithGemini(imageBase64) {
    const requestBody = {
        contents: [{
            parts: [{
                text: "Extract all text from this image. Return only the extracted text without any additional commentary."
            }, {
                inline_data: {
                    mime_type: "image/png",
                    data: imageBase64.split(',')[1]
                }
            }]
        }],
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error processing image with Gemini:', error);
        throw error;
    }
}

async function handleOCRCapture(area, sender) {
    try {
        const tab = await chrome.tabs.get(sender.tab.id);

        // Capture the selected area
        const imageData = await chrome.tabs.captureVisibleTab(null, {
            format: 'png',
            quality: 100
        });

        // Process with Gemini
        const extractedText = await processImageWithGemini(imageData);

        // Send result back to the popup
        chrome.runtime.sendMessage({
            action: 'ocrResult',
            text: extractedText
        });

    } catch (error) {
        console.error('Error in OCR capture:', error);
    }
}



// Add this new message listener in background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureOCRArea') {
        handleOCRCapture(message.area, sender);
        return true;
    }

    if (message.action === 'downloadCroppedImage') {
        downloadScreenshot(message.dataUrl);
        return true;
    }
});