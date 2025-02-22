// Wait until DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".hex__container");
    const hexDisplay = document.getElementById("hexDynamicDisplay");
    const pickColorButton = document.getElementById("pickColorButton");
    const clearMemoryButton = document.getElementById("clearMemoryButton");

    // Notification function
    const showNotification = (background, text) => {
        const notification = document.createElement("p");
        notification.className = "hex__notification";
        notification.style.backgroundColor = background;
        notification.textContent = text;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    };

    // Render saved Hex values as dynamic squares
    const renderHexColors = () => {
        hexDisplay.innerHTML = ""; // Clear existing elements
        chrome.storage.local.get("color_hex_code", (data) => {
            const savedColors = data.color_hex_code || [];
            savedColors.forEach((hexCode) => {
                const colorBox = document.createElement("div");
                colorBox.className = "hex__color-square";
                colorBox.style.backgroundColor = hexCode;
                colorBox.textContent = hexCode;
                colorBox.addEventListener("click", () => {
                    navigator.clipboard.writeText(hexCode)
                        .then(() => {
                            showNotification("#e19526", "Hex code copied to clipboard!");
                        })
                        .catch(() => {
                            showNotification("#ad5049", "Failed to copy Hex code.");
                        });
                });
                hexDisplay.appendChild(colorBox);
            });
        });
    };

    // "Pick Color" button click event
    pickColorButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];

            // Check if the current page is accessible
            if (!activeTab || activeTab.url.startsWith("chrome://") || activeTab.url.startsWith("file://")) {
                showNotification("#ad5049", "Cannot pick color from this page.");
                return;
            }

            if (!window.EyeDropper) {
                showNotification("#ad5049", "Your browser does not support the EyeDropper API.");
                return;
            }

            // Activate EyeDropper API and save the selected color
            const eyeDropper = new EyeDropper();
            eyeDropper.open()
                .then((result) => {
                    chrome.storage.local.get("color_hex_code", (data) => {
                        const colors = data.color_hex_code || [];
                        colors.push(result.sRGBHex);
                        chrome.storage.local.set({ color_hex_code: colors }, () => {
                            renderHexColors(); // Refresh color display
                        });
                    });
                })
                .catch(() => {
                    showNotification("#ad5049", "Failed to pick color.");
                });
        });
    });

    // "Clear Memory" button click event
    clearMemoryButton.addEventListener("click", () => {
        chrome.storage.local.remove("color_hex_code", () => {
            renderHexColors(); // Clear color display
            showNotification("#e19526", "Memory cleared successfully!");
        });
    });

    // Load saved Hex values initially
    renderHexColors();
});