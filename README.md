# Toolz Chrome Extension 🛠️

A powerful Chrome extension that combines essential productivity tools in one place.
Visit the Chrome Web Store (https://chromewebstore.google.com/detail/toolz/fdjdcmfdhllmllkofddfanglebngpalm?authuser=2&hl=en-GB)

![logo](https://github.com/user-attachments/assets/fdb1c1df-f472-46d9-9fa0-11f49b7c40ec)

## Tech Stack 🛠️
- Vanilla JavaScript
- HTML5
- SASS
- Chrome Extension APIs
- Google Gemini API
- OCR.space API

## Features ✨

### 1. AI Summary 🤖
- Quickly summarize any webpage content using Google's Gemini AI
- Clean, concise summaries delivered in 3-5 sentences
- Copy functionality for easy sharing

### 2. OCR (Optical Character Recognition) 📝
- Extract text from images
- Supports drag-and-drop or file upload
- Powered by OCR.space API

### 3. Hex Finder 🎨
- Pick colors from any webpage
- Automatically saves color history
- Click to copy hex codes

### 4. Timer ⏲️
- Set custom countdown timers
- Pause, resume, and reset functionality
- Notification when timer completes
- Persistent timing across browser sessions

### 5. Snaps 📸
- Capture webpage screenshots
- Automatic file naming with timestamps
- Simple one-click capture process

## Installation 💻

### From Chrome Web Store
1. Visit the Chrome Web Store (https://chromewebstore.google.com/detail/toolz/fdjdcmfdhllmllkofddfanglebngpalm?authuser=2&hl=en-GB)
2. Click "Add to Chrome"
3. Follow the browser prompts to complete installation

### Local Development Setup
1. Clone the repository:
```bash
git clone [repository-url]
cd toolz-extension
```

2. Configure API Keys:
   - Copy `config.template.js` to `config.js`
   - Add your API keys:
     - Get Gemini API key from Google AI Studio
     - Get OCR API key from OCR.space

```javascript
const config = {
    API_KEY: "YOUR_GEMINI_API_KEY",
    OCR_KEY: "YOUR_OCR_SPACE_KEY"
};
```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory


