const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const countdownDisplay = document.getElementById('countdown-display');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const container = document.querySelector(".timer__container");


const showNotification = (background, text) => {
    const notification = document.createElement("div");
    notification.className = "timer__notification";
    notification.style.backgroundColor = background;
    notification.textContent = text;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
};


function updateCountdownDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    countdownDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


function loadTimerState() {
    chrome.storage.local.get(["totalSeconds", "showNotification"], (result) => {
        const totalSeconds = result.totalSeconds || 0;
        updateCountdownDisplay(totalSeconds);

        if (result.showNotification) {
            showNotification("#4CAF50", "Timer Complete!");
            chrome.storage.local.set({
                showNotification: false,
                completed: false
            });
        }
    });
}

startButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "getTime" }, (response) => {
        const remainingSeconds = response.totalSeconds || 0;

        if (remainingSeconds > 0) {
            chrome.runtime.sendMessage({ command: "start" }, (res) => {
                console.log(res.status);
            });
        } else {
            const mins = parseInt(minutesInput.value || "0", 10);
            const secs = parseInt(secondsInput.value || "0", 10);
            const totalSeconds = mins * 60 + secs;

            if (totalSeconds === 0) {
                showNotification("#f44336", "Please enter a time greater than 0.");
                return;
            }

            chrome.runtime.sendMessage({ command: "start", totalSeconds }, (res) => {
                console.log(res.status);
                updateCountdownDisplay(totalSeconds);
            });
        }
    });
});


pauseButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "pause" }, (response) => {
        console.log(response.status);
    });
});

y
resetButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "reset" }, (response) => {
        console.log(response.status);
        updateCountdownDisplay(0);
    });
});


setInterval(() => {
    loadTimerState();
}, 500);


document.addEventListener('DOMContentLoaded', () => {
    loadTimerState();
    chrome.runtime.sendMessage({ command: "initializePopup" });
});