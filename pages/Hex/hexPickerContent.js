chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.from === "popup" && message.query === "eye_dropper_clicked") {
        setTimeout(async () => {
            if (!window.EyeDropper) {
                return;
            }

            try {
                const eyeDropper = new EyeDropper();
                const result = await eyeDropper.open();

                chrome.storage.local.get("color_hex_code", (resp) => {
                    const savedColors = resp.color_hex_code || [];
                    savedColors.push(result.sRGBHex);

                    chrome.storage.local.set({ color_hex_code: savedColors }, () => {
                        chrome.runtime.sendMessage({
                            action: "reopen_popup",
                            path: "pages/Hex/Hex.html"
                        });
                    });
                });
            } catch (error) {
            }
        }, 500);
    }
});