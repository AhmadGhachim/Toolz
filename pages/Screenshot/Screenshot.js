document.addEventListener("DOMContentLoaded", () => {
    const windowButton = document.querySelector(".screenshot__button--window");
    const scrollingButton = document.querySelector(".screenshot__button--scrolling");
    const notification = document.querySelector(".screenshot__notification");

    // Helper: Display notification
    const showNotification = (message, type = "info") => {
        notification.textContent = message;
        notification.className = `screenshot__notification screenshot__notification--${type}`;
        notification.style.display = "block";
        setTimeout(() => (notification.style.display = "none"), 3000);
    };

    // **1. Window Screenshot Logic**
    windowButton.addEventListener("click", () => {
        chrome.tabs.captureVisibleTab((dataUrl) => {
            if (chrome.runtime.lastError) {
                showNotification("Failed to capture window screenshot.", "error");
                return;
            }

            // Trigger download
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `window-screenshot-${Date.now()}.png`;
            link.click();

            showNotification("Window screenshot captured successfully!");
        });
    });

    // **2. Scrolling Screenshot Logic**
    scrollingButton.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            // Call content script to handle full-page capture
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ["pages/Screenshot/screenshotContent.js"],
                },
                () => {
                    if (chrome.runtime.lastError) {
                        showNotification("Failed to capture scrolling screenshot.", "error");
                    } else {
                        showNotification("Scrolling screenshot captured successfully!");
                    }
                }
            );
        } catch (error) {
            console.error(error);
            showNotification("An error occurred while capturing the screenshot.", "error");
        }
    });
});