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

// Screenshot functionality
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureArea') {
        handleAreaCapture();
        return true;
    } else if (message.action === 'captureFullPage') {
        handleFullPageCapture();
        return true;
    } else if (message.action === 'captureSelectedArea') {
        handleSelectedAreaCapture(message.area);
        return true;
    }
});

function downloadScreenshot(dataUrl) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;

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

        const capture = await chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        });

        try {
            const existingContexts = await chrome.runtime.getContexts({
                contextTypes: ['OFFSCREEN_DOCUMENT']
            });

            if (existingContexts.length === 0) {
                await chrome.offscreen.createDocument({
                    url: 'pages/Screenshot/offscreen.html',
                    reasons: ['DOM_PARSER'],
                    justification: 'Screenshot cropping'
                });
                // Small delay to ensure document is ready
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (e) {
            console.error('Error creating offscreen document:', e);
        }

        // Send message to offscreen document to crop the image
        chrome.runtime.sendMessage({
            action: 'cropImage',
            imageDataUrl: capture,
            area: area
        });

    } catch (error) {
        console.error('Error in selected area capture:', error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'downloadCroppedImage') {
        downloadScreenshot(message.dataUrl);
        return true;
    }
});


let isColorPickerActive = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "reopen_popup") {
        if (isColorPickerActive) {
            chrome.action.setPopup({ popup: message.path }, () => {
                chrome.action.openPopup();
                setTimeout(() => {
                    isColorPickerActive = false;
                    chrome.action.setPopup({ popup: 'index.html' });
                }, 1000);
            });
        }
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === "popup" && message.query === "eye_dropper_clicked") {
        isColorPickerActive = true;
    }
});