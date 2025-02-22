// Attach the start button listener
document.getElementById("start-hex-picker").addEventListener("click", (event) => {
    console.log("Start button clicked. Initializing color picker process.");
    event.stopPropagation();
    initializeColorPicker();
});

// Initialize the color picker process
function initializeColorPicker() {
    const notification = document.getElementById("notification");
    notification.textContent = "Hover over elements to find the hex color. Click to copy the hex value.";
    notification.style.color = "#333";
    console.log("Adding hover and click event listeners...");
    document.addEventListener("mouseover", handleHover);
    document.addEventListener("click", handleClick);
}

// Handle hover to display the element's hex color in the notification
function handleHover(event) {
    if (event.target.id === "start-hex-picker") return;

    const hoveredElement = event.target;
    console.log("Hovering over element:", hoveredElement);

    const computedStyle = window.getComputedStyle(hoveredElement);
    const backgroundColor = computedStyle.backgroundColor;

    const hexColor = rgbToHex(backgroundColor);
    console.log(`Computed Hex Value while hovering: ${hexColor}`);

    const notification = document.getElementById("notification");
    notification.textContent = `Hovering Hex Value: ${hexColor}`;
}

// Handle click to copy the hex color to clipboard and notify the user
function handleClick(event) {
    if (event.target.id === "start-hex-picker") {
        console.log("Ignoring click on start button.");
        return;
    }

    const element = event.target;
    console.log("Clicked on element:", element);

    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const hexColor = rgbToHex(backgroundColor);
    console.log(`Hex Value to copy: ${hexColor}`);

    const notification = document.getElementById("notification");

    navigator.clipboard.writeText(hexColor).then(() => {
        notification.textContent = `Copied ${hexColor} to clipboard!`;
        notification.style.color = "#007BFF";
        console.log("Successfully copied the hex color to clipboard.");
    }).catch(() => {
        notification.textContent = "Failed to copy!";
        notification.style.color = "#FF0000";
        console.warn("Failed to copy the hex color to clipboard.");
    });

    console.log("Removing event listeners after valid click...");
    cleanupEvents();
}

// Cleanup: Remove the event listeners
function cleanupEvents() {
    console.log("Cleaning up hover and click event listeners...");
    document.removeEventListener("mouseover", handleHover);
    document.removeEventListener("click", handleClick);
}

// Convert RGB color to Hex format
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g).map(Number);
    console.log("Converted RGB array:", rgbArray);
    return `#${rgbArray.map(val => val.toString(16).padStart(2, '0')).join('')}`;
}
