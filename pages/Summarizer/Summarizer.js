import config from '../../config.js';

const summarizeButton = document.getElementById("summarize-button");
const summaryOutput = document.getElementById("summary-output");
const copyIcon = document.getElementById("copy-icon");

async function extractArticleContent() {
    let timeoutId;

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            reject("Content extraction timed out. Unable to extract content from the page.");
        }, 10000);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs?.length) {
                clearTimeout(timeoutId);
                return reject("No active tab found to extract content from.");
            }

            const activeTab = tabs[0];
            if (!activeTab.id) {
                clearTimeout(timeoutId);
                return reject("Invalid tab ID.");
            }

            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    func: () => {
                        try {
                            const article = document.querySelector("article");
                            if (article?.innerText.trim()) {
                                return article.innerText.trim();
                            }

                            const mainContent = document.querySelector("main") || document.body;
                            if (mainContent?.innerText.trim()) {
                                return mainContent.innerText.trim();
                            }

                            throw new Error("No meaningful content found on this page.");
                        } catch (error) {
                            throw new Error(error.message);
                        }
                    },
                },
                (results) => {
                    clearTimeout(timeoutId);

                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError.message);
                    }

                    if (!results?.length) {
                        return reject("Failed to retrieve results from the page.");
                    }

                    const extractedContent = results[0]?.result;
                    if (extractedContent?.trim()) {
                        resolve(extractedContent);
                    } else {
                        reject("Failed to extract meaningful content.");
                    }
                }
            );
        });
    });
}

async function fetchSummary(articleContent) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.API_KEY}`;
    const geminiPrompt = "Summarize the content of the following text in a clear, coherent, and concise manner. " +
        "Capture the essential points, key arguments, and any actionable insights in 3-5 sentences. " +
        "Use plain, natural language with a neutral, professional tone, and ensure the summary flows logically " +
        "without unnecessary details.";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${geminiPrompt}\n\n${articleContent}` }]
                }],
                generationConfig: { temperature: 0.7, top_p: 0.9 }
            })
        });

        if (!response.ok) {
            throw new Error("Failed to generate summary. Please try again.");
        }

        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            throw new Error("Failed to generate a meaningful summary.");
        }

        return summary;
    } catch (error) {
        throw new Error("Failed to generate summary: " + error.message);
    }
}

async function handleSummarize() {
    summarizeButton.disabled = true;
    summaryOutput.value = "Generating summary...";

    try {
        const articleContent = await extractArticleContent();
        const summary = await fetchSummary(articleContent);
        summaryOutput.value = summary;
    } catch (error) {
        summaryOutput.value = "";
    } finally {
        summarizeButton.disabled = false;
    }
}

function copyToClipboard() {
    const text = summaryOutput.value;
    if (!text) return;

    navigator.clipboard.writeText(text).catch(() => {});
}


summarizeButton.addEventListener("click", handleSummarize);
copyIcon.addEventListener("click", copyToClipboard);


document.addEventListener("DOMContentLoaded", () => {
    summaryOutput.value = "";
});