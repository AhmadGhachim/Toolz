const tools = [
    {
        name: 'Timer',
        description: 'Set and manage countdowns.',
        image: 'assets/images/timer.webp',
        backgroundColor: '#F29A9D',
        link: 'pages/Timer/Timer.html'
    },
    {
        name: 'AI Summary',
        description: 'Summarize text using AI.',
        image: 'assets/images/summary.webp',
        backgroundColor: '#A9E5BB',
        link: 'pages/Summarizer/Summarizer.html'
    },
    {
        name: 'Hex Finder',
        description: 'Quickly extract hex colors.',
        image: 'assets/images/hex.webp',
        backgroundColor: '#C3A2E8',
        link: 'pages/Hex/Hex.html'
    },
    {
        name: 'OCR',
        description: 'Extract text from images.',
        image: 'assets/images/ocr.webp',
        backgroundColor: '#91D9F8',
        link: 'pages/OCR/OCR.html'
    },
    {
        name: 'Snaps',
        description: 'A webpage screenshot tool.',
        image: 'assets/images/screenshot.webp',
        backgroundColor: '#FFB380',
        link: 'pages/Screenshot/Screenshot.html'
    }

];

let currentIndex = 0;

const arrowRight = document.getElementById('arrow-right');
const arrowLeft = document.getElementById('arrow-left');
const toolzItem = document.getElementById('toolz-item');

const updateToolDisplay = () => {
    const currentTool = tools[currentIndex];
    toolzItem.querySelector('.toolz__icon-image').src = currentTool.image;
    toolzItem.querySelector('.toolz__icon').style.backgroundColor = currentTool.backgroundColor;
    toolzItem.querySelector('.toolz__name').innerText = currentTool.name;
    toolzItem.querySelector('.toolz__description').innerText = currentTool.description;
    toolzItem.href = currentTool.link;
};

arrowRight.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % tools.length;
    updateToolDisplay();
});

arrowLeft.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + tools.length) % tools.length;
    updateToolDisplay();
});

updateToolDisplay();