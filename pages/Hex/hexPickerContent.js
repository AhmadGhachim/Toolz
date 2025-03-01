// Listen for messages to trigger the EyeDropper API
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.from === "popup" && message.query === "eye_dropper_clicked") {
        setTimeout(() => {
            if (!window.EyeDropper) {
                console.error("EyeDropper API is not supported in your browser.");
                return;
            }

            const eyeDropper = new EyeDropper();

            // Open EyeDropper and handle the selected color
            eyeDropper.open()
                .then(result => {
                    chrome.storage.local.get("color_hex_code", (resp) => {
                        const savedColors = resp.color_hex_code || [];
                        savedColors.push(result.sRGBHex);

                        chrome.storage.local.set({ color_hex_code: savedColors }, () => {
                            console.log("Color saved:", result.sRGBHex);
                            // After saving the color, send message to reopen popup
                            chrome.runtime.sendMessage({
                                action: "reopen_popup",
                                path: "pages/Hex/Hex.html"
                            });
                        });
                    });
                })
                .catch(error => {
                    console.error("Error using EyeDropper API:", error);
                });
        }, 500);
    }
});