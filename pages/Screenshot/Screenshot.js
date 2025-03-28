document.addEventListener("DOMContentLoaded", () => {
    const windowButton = document.querySelector(".screenshot__button--window");
    const notification = document.querySelector(".screenshot__notification");

    const showNotification = (message, type = "info") => {
        notification.textContent = message;
        notification.className = `screenshot__notification screenshot__notification--${type}`;
        notification.style.display = "block";
        setTimeout(() => (notification.style.display = "none"), 3000);
    };

    windowButton.addEventListener("click", () => {
        try {
            chrome.runtime.sendMessage(
                { action: "captureVisibleTab", from: "screenshot" },
                (dataUrl) => {
                    if (chrome.runtime.lastError) {
                        showNotification("Failed to capture screenshot: " + chrome.runtime.lastError.message, "error");
                        return;
                    }

                    if (!dataUrl) {
                        showNotification("Failed to capture window screenshot.", "error");
                        return;
                    }

                    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = `window-screenshot-${timestamp}.png`;
                    link.click();

                    showNotification("Window screenshot captured successfully!");
                }
            );
        } catch (error) {
            showNotification("Failed to capture screenshot: " + error.message, "error");
        }
    });
});