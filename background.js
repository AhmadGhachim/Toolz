// Timer state management
let countdownInterval = null;
let totalSeconds = 0;
let isColorPickerActive = false;

// Timer functions
function saveTimerState() {
    chrome.storage.local.set({ totalSeconds });
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

// Consolidated message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Timer commands
    if (message.command) {
        switch (message.command) {
            case "start":
                startCountdown(message.totalSeconds || null);
                sendResponse({ status: "started" });
                break;
            case "pause":
                pauseCountdown();
                sendResponse({ status: "paused" });
                break;
            case "reset":
                resetCountdown();
                sendResponse({ status: "reset" });
                break;
            case "getTime":
                sendResponse({ totalSeconds });
                break;
        }
        return;
    }

    // Color picker handling
    if (message.from === "popup" && message.query === "eye_dropper_clicked") {
        isColorPickerActive = true;
        return;
    }

    // Popup reopen handling
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
        return;
    }

    // Screenshot handling
    if (message.action === "captureVisibleTab" && message.from === "screenshot") {
        try {
            chrome.tabs.captureVisibleTab(null, { format: "png" }, dataUrl => {
                if (chrome.runtime.lastError) {
                    sendResponse(null);
                } else {
                    sendResponse(dataUrl);
                }
            });
            return true;
        } catch (error) {
            sendResponse(null);
            return true;
        }
    }
});