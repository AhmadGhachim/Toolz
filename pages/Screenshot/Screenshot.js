document.addEventListener("DOMContentLoaded", () => {
    const windowButton = document.querySelector(".screenshot__button--window");
    const scrollingButton = document.querySelector(".screenshot__button--scrolling");
    const notification = document.querySelector(".screenshot__notification");

    // Helper: Show notifications
    const showNotification = (message, type = "info") => {
        notification.textContent = message;
        notification.className = `screenshot__notification screenshot__notification--${type}`;
        notification.style.display = "block";
        setTimeout(() => (notification.style.display = "none"), 3000);
    };

    windowButton.addEventListener("click", async () => {
        chrome.runtime.sendMessage(
            { action: "captureVisibleTab", from: "screenshot" }, // Add identifying information
            (dataUrl) => {
                if (!dataUrl) {
                    showNotification("Failed to capture window screenshot.", "error");
                    return;
                }

                // Trigger download only if message is captured successfully
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `window-screenshot-${Date.now()}.png`;
                link.click();

                showNotification("Window screenshot captured successfully!");
            }
        );
    });

    scrollingButton.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if we can inject into this tab
            if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
                showNotification("Cannot capture screenshots of this page type.", "error");
                return;
            }

            showNotification("Starting screenshot capture...");

            // Inject the flag
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    window.scrollingScreenshotRequested = true;
                    console.log('Screenshot flag set');
                }
            });

            // Inject the content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["pages/Screenshot/screenshotContent.js"]
            });

        } catch (error) {
            console.error('Screenshot initialization error:', error);
            showNotification("Failed to start screenshot: " + error.message, "error");
        }
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "handleError") {
            showNotification(message.message, "error");
        }
    });
});