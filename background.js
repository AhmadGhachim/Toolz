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



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureVisibleTab" && message.from === "screenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, dataUrl => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse(null);
            } else {
                sendResponse(dataUrl);
            }
        });
        return true;
    }

    if (message.action === "screenshotCompleted") {
        console.log('Screenshot completed, preparing download...');
        try {
            chrome.downloads.download({
                url: message.dataUrl,
                filename: `scrolling-screenshot-${message.timestamp}.png`,
                saveAs: false
            }, downloadId => {
                if (chrome.runtime.lastError) {
                    console.error('Download error:', chrome.runtime.lastError);
                    sendResponse({status: 'error', error: chrome.runtime.lastError});
                } else {
                    sendResponse({status: 'success', downloadId});
                }
            });
        } catch (error) {
            console.error('Screenshot download error:', error);
            sendResponse({status: 'error', error: error.message});
        }
        return true;
    }
});