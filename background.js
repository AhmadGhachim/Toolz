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


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === 'processOCR') {
        processImageWithGemini(message.imageData);
        sendResponse({status: "processing"});
        return true;
    }
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
});


const GEMINI_API_KEY = 'AIzaSyChmbtA0ZpyDhoRXXOTeU9r7L5f7tRBU5Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';


async function processImageWithGemini(imageData) {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GEMINI_API_KEY}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Extract text from this image"
                    }, {
                        inlineData: {
                            mimeType: "image/png",
                            data: imageData.split(',')[1]
                        }
                    }]
                }]
            })
        });

        const result = await response.json();
        const extractedText = result.candidates[0].content.parts[0].text;

        // Store result instead of sending to popup
        chrome.storage.local.set({ ocrResult: extractedText });
    } catch (error) {
        console.error('OCR processing failed:', error);
        chrome.storage.local.set({ ocrError: error.message });
    }
}
