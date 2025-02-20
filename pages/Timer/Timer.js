const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const countdownDisplay = document.getElementById('countdown-display');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

let countdownInterval = null;
let totalSeconds = 0;

function updateCountdownDisplay() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    countdownDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startCountdown() {
    if (countdownInterval) return;

    if (totalSeconds === 0) {
        const mins = parseInt(minutesInput.value || '0', 10);
        const secs = parseInt(secondsInput.value || '0', 10);

        totalSeconds = mins * 60 + secs;

        if (totalSeconds === 0) {
            alert('Please enter a time greater than 0.');
            return;
        }
    }

    countdownInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds -= 1;
            updateCountdownDisplay();
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }, 1000);

    updateCountdownDisplay();
}

function pauseCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    totalSeconds = 0;
    updateCountdownDisplay();
    minutesInput.value = '';
    secondsInput.value = '';
}

startButton.addEventListener('click', startCountdown);
pauseButton.addEventListener('click', pauseCountdown);
resetButton.addEventListener('click', resetCountdown);

updateCountdownDisplay();