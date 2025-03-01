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
                            chrome.runtime.sendMessage({
                                action: "reopen_popup",
                                path: "pages/Hex/Hex.html"
                            });
                        });
                    });
                })
                .catch(error => {
                    if (error.name !== 'AbortError') {
                        let errorMessage = "Failed to use color picker";

                        if (error.name === 'NotAllowedError') {
                            errorMessage = "This website doesn't allow color picking for security reasons";
                        }

                        console.error("EyeDropper error:", error.name, error.message);

                        chrome.runtime.sendMessage({
                            action: "picker_error",
                            error: errorMessage
                        });
                    }
                });
        }, 500);
    }
});