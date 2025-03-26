document.addEventListener("DOMContentLoaded", () => {
    const windowButton = document.querySelector(".screenshot__button--window");
    const scrollingButton = document.querySelector(".screenshot__button--scrolling");
    const notification = document.querySelector(".screenshot__notification");

    const showNotification = (message, type = "info") => {
        notification.textContent = message;
        notification.className = `screenshot__notification screenshot__notification--${type}`;
        notification.style.display = "block";
        setTimeout(() => (notification.style.display = "none"), 3000);
    };

    windowButton.addEventListener("click", async () => {
        try {
            chrome.runtime.sendMessage(
                { action: "captureVisibleTab", from: "screenshot" },
                (dataUrl) => {
                    if (!dataUrl) {
                        showNotification("Failed to capture window screenshot.", "error");
                        return;
                    }

                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = `window-screenshot-${Date.now()}.png`;
                    link.click();

                    showNotification("Window screenshot captured successfully!");
                }
            );
        } catch (error) {
            showNotification("Failed to capture screenshot: " + error.message, "error");
        }
    });

    scrollingButton.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) {
                showNotification("Cannot capture screenshots of this page type.", "error");
                return;
            }

            showNotification("Starting screenshot capture...");

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Screenshot initialization timed out")), 5000);
            });

            await Promise.race([
                Promise.all([
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            window.scrollingScreenshotRequested = true;
                            return true;
                        }
                    }),
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["pages/Screenshot/screenshotContent.js"]
                    })
                ]),
                timeoutPromise
            ]);

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