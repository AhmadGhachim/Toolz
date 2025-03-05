# Toolz - Chrome Productivity Extension

![logo](https://github.com/user-attachments/assets/fdb1c1df-f472-46d9-9fa0-11f49b7c40ec)

Toolz is a comprehensive Chrome extension that brings together essential productivity tools in one convenient package. Whether you need to set timers, summarize content, or pick colors, Toolz has got you covered.

Chrome Web Store link: https://chromewebstore.google.com/detail/fdjdcmfdhllmllkofddfanglebngpalm?utm_source=item-share-cb

## Features

### 🕒 Timer
- Set custom countdown timers
- Pause and resume functionality
- Visual notifications
- Persists across browser sessions

### 🤖 AI Summary
- Summarize any webpage content using Gemini AI
- One-click summarization
- Copy summary to clipboard
- Clear, concise summaries of long articles

### 🎨 Hex Finder
- Extract color codes from any webpage
- Click to copy hex values
- Real-time color preview

### 🔜 Coming Soon
- OCR (Optical Character Recognition)
- Screenshot Tool (Snaps)

## Installation

### From Chrome Web Store
link: https://chromewebstore.google.com/detail/fdjdcmfdhllmllkofddfanglebngpalm?utm_source=item-share-cb

### Local Development Installation
1. Clone this repository:
```bash
git clone https://github.com/yourusername/toolz.git
```
2. Create a `config.js` file from the template:
```bash
cp config.template.js config.js
```
3. Add your Gemini API key to `config.js`
4. Watch SCSS to apply styling.
5. Open Chrome and navigate to `chrome://extensions/`
6. Enable "Developer mode" in the top right
7. Click "Load unpacked" and select the project directory

## Setup

### API Key Configuration
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `config.template.js` to `config.js`
3. Replace `YOUR_API_KEY_HERE` with your actual Gemini API key

## Usage

### Timer
1. Click the Toolz icon in your Chrome toolbar
2. Select the Timer tool
3. Enter minutes and seconds
4. Use Play, Pause, and Reset controls as needed

### AI Summary
1. Navigate to any webpage you want to summarize
2. Click the Toolz icon
3. Select AI Summary
4. Click "Summarize Page"
5. Use the copy icon to copy the summary

### Hex Finder
1. Select the Hex Finder tool
2. Click anywhere on the page to get the color code
3. Color codes are automatically copied to clipboard

## Technical Requirements
- Chrome Browser (Version 88 or higher)
- Active internet connection for AI summarization
- Gemini API key for summarization feature

## Privacy
- No user data is collected or stored
- API keys are stored locally in Chrome storage
- Summarization requests are made directly to Google's Gemini API


## Support
For support, please open an issue in the GitHub repository 
