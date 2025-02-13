# Toolz: The All-in-One Chrome Extension

![Logo](https://github.com/user-attachments/assets/3aa80510-eccc-4269-af6b-23b4e5f1fa20)

## Overview
**Toolz** is a versatile Chrome extension designed to eliminate the need for multiple browser extensions by offering a suite of essential utilities in one package. Each tool is represented by a unique, pixelated character that enhances the user experience, making interactions more engaging and intuitive.

## Problem
Users often find themselves installing multiple Chrome extensions to handle everyday tasks such as extracting text from images, summarizing web pages, taking screenshots, managing time, and identifying colors. This results in:
- Browser clutter and decreased performance
- Inconsistent UI/UX across different extensions
- Security risks from installing multiple third-party extensions

Toolz solves these issues by bundling essential tools into a single, user-friendly extension with a consistent design language and fun character themes.

## User Profile
**Primary Users:**
- Students who frequently take notes from images and summarize articles
- Professionals who need quick screenshots and time management tools
- Designers and developers looking for accurate color identification
- General internet users seeking an all-in-one browser assistant

## Features
- **OCR Tool**: Select an image area to extract text and copy it to the clipboard
- **Webpage Summarizer**: Uses AI to scan and summarize webpage content
- **Screenshot Tool**: Capture full-page or selected areas with rectangle selection
- **Timer**: A simple countdown timer with pause/resume functionality
- **Hex Color Finder**: Detect and copy pixel color values when hovering over images
- **Pixelated-Themed Assistants (Bonus)**: Each tool is represented by a unique, friendly character

## Implementation
### **Tech Stack**
- **Frontend:** HTML, CSS (Sass), JavaScript (Vanilla); React for the Tool Webpage
- **Backend:** Node.js, Express
- **APIs:** OCR API, Gemini API
- **Storage:** Local Storage for settings and session data

### **Extension Permissions**
- `ActiveTab`: To interact with user-selected elements
- `Storage`: To save user preferences and settings
- `ClipboardWrite`: For copying extracted text
- `Screenshots`: For capturing and saving images

## Roadmap
### **Phase 1: Core Development**
- Set up Chrome extension boilerplate
- Implement basic UI and settings page
- Develop OCR tool and clipboard integration
- Implement screenshot tool with rectangle selection

### **Phase 2: Feature Expansion**
- Integrate AI summarization using external APIs
- Implement timer with UI interactions
- Develop hex color finder tool
- Enhance UI with cartoony character designs

### **Phase 3: Optimization & Deployment**
- Conduct UX testing and gather feedback
- Optimize performance and reduce memory usage
- Publish on Chrome Web Store
- Market extension via forums, social media, and tech blogs

## Proof of Concept
For this proposal, I created a proof-of-concept Chrome extension featuring a timer with additional functionality to create an API request to Gemini to retrieve a random timer value.

![image](https://github.com/user-attachments/assets/d40f352f-70bc-4a4c-b972-2715e979fc28)

## Mockups
The mockups below are not finalized and will change.
![HomePage](https://github.com/user-attachments/assets/bb584259-01fd-4ab4-9e6d-0a6ef59ba614)
![OCR](https://github.com/user-attachments/assets/0822a624-4149-42bf-b4d0-7ad97829f613)
![Summarizer](https://github.com/user-attachments/assets/88861842-9292-4f99-b3ee-e2568e94c0e4)
![Screenshot](https://github.com/user-attachments/assets/6193f5ec-8dda-472e-8334-c5e0c6ff15d0)
![Hex](https://github.com/user-attachments/assets/a865ca4a-3503-4789-b20a-33769bd595a3)
![Timer](https://github.com/user-attachments/assets/39952f1e-a588-4a3b-82aa-62c8c18216e3)

## Pixelated Characters Concept
AI-generated concept characters.
![Gemini_Generated_Image_f4aok5f4aok5f4ao](https://github.com/user-attachments/assets/47c582c1-10dd-450c-b71f-3679cb5e1b5f)
![Gemini_Generated_Image_dy86o8dy86o8dy86](https://github.com/user-attachments/assets/2b4f402c-b12d-4a43-9b73-f7b660ce1d2a)
![Gemini_Generated_Image_2jcj7w2jcj7w2jcj](https://github.com/user-attachments/assets/0b020bdd-cb73-45ec-9f7e-2d736f4d4409)
![Gemini_Generated_Image_dc40pxdc40pxdc40](https://github.com/user-attachments/assets/1985b848-2b2f-4f46-bc37-36e5eca1b011)
![Gemini_Generated_Image_nmc2ajnmc2ajnmc2](https://github.com/user-attachments/assets/4f6be893-4b40-447b-9e79-9249d110b1a3)

## Conclusion
Toolz aims to streamline the browsing experience by providing a collection of powerful tools under one extension. With a fun, cartoony aesthetic and an intuitive interface, Toolz will become the ultimate browser assistant for everyday users.
