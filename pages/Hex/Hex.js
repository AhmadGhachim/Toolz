const getBrightness = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (r * 0.299 + g * 0.587 + b * 0.114);
};

window.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".hex__container");
    const hexDisplay = document.getElementById("hexDynamicDisplay");
    const pickColorButton = document.getElementById("pickColorButton");
    const clearMemoryButton = document.getElementById("clearMemoryButton");

    const showNotification = (background, text) => {
        const notification = document.createElement("p");
        notification.className = "hex__notification";
        notification.style.backgroundColor = background;
        notification.textContent = text;
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    };

    const createColorBox = (hexCode) => {
        const colorBox = document.createElement("div");
        colorBox.className = "hex__color-square";
        colorBox.style.backgroundColor = hexCode;
        colorBox.style.color = getBrightness(hexCode) > 128 ? "#000" : "#fff";
        colorBox.textContent = hexCode;

        colorBox.addEventListener("click", () => {
            navigator.clipboard.writeText(hexCode)
                .then(() => showNotification("#e19526", "Hex code copied to clipboard!"))
                .catch(() => showNotification("#ad5049", "Failed to copy Hex code."));
        });

        return colorBox;
    };

    const renderHexColors = () => {
        hexDisplay.innerHTML = "";
        chrome.storage.local.get("color_hex_code", (data) => {
            const savedColors = data.color_hex_code || [];
            savedColors.forEach(hexCode => {
                hexDisplay.appendChild(createColorBox(hexCode));
            });
        });
    };

    const initializeColorPicker = async (activeTab) => {
        if (!activeTab || activeTab.url.startsWith("chrome://") || activeTab.url.startsWith("file://")) {
            throw new Error("Cannot pick color from this page.");
        }

        if (!window.EyeDropper) {
            throw new Error("Your browser does not support the EyeDropper API.");
        }

        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['pages/Hex/hexPickerContent.js']
        });

        chrome.runtime.sendMessage({ from: "popup", query: "eye_dropper_clicked" });
        chrome.tabs.sendMessage(activeTab.id, { from: "popup", query: "eye_dropper_clicked" });
        window.close();
    };

    pickColorButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            try {
                await initializeColorPicker(tabs[0]);
            } catch (error) {
                showNotification("#ad5049", error.message);
            }
        });
    });

    clearMemoryButton?.addEventListener("click", () => {
        chrome.storage.local.set({ color_hex_code: [] }, () => {
            renderHexColors();
            showNotification("#4CAF50", "Color memory cleared!");
        });
    });

    renderHexColors();
});