const summarizeButton = document.getElementById("summarize-button");
const summaryOutput = document.getElementById("summary-output");

/**
 * Extract the main article or body content from the current active tab.
 * Logs the extracted content for debugging purposes.
 * Includes a timeout to prevent hanging forever.
 */
async function extractArticleContent() {
    const timeout = 10000; // Set timeout duration in milliseconds
    let timeoutId; // Variable to hold timeout

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            console.error("Error: Content extraction timed out.");
            reject("Content extraction timed out. Unable to extract content from the page.");
        }, timeout);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                clearTimeout(timeoutId); // Clear the timeout
                console.error("No active tab found.");
                return reject("No active tab found to extract content from.");
            }

            const activeTab = tabs[0]; // Get the active tab

            // Ensure activeTab.id exists to avoid errors
            if (!activeTab.id) {
                clearTimeout(timeoutId); // Clear the timeout
                console.error("Error: No valid tab ID found.");
                return reject("Invalid tab ID.");
            }

            // Inject and execute script to extract content
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    func: () => {
                        try {
                            // Try extracting from article tag
                            const article = document.querySelector("article");
                            if (article && article.innerText.trim()) {
                                return article.innerText.trim();
                            }

                            // Fall back to main or body content
                            const mainContent = document.querySelector("main") || document.body;
                            if (mainContent && mainContent.innerText.trim()) {
                                return mainContent.innerText.trim();
                            }

                            // If no meaningful content is found, return an error message
                            return "Error: No meaningful content found on this page.";
                        } catch (error) {
                            return `Error: Failed to extract content due to: ${error.message}`;
                        }
                    },
                },
                (results) => {
                    clearTimeout(timeoutId);

                    // Check and handle results from scripting API
                    if (chrome.runtime.lastError) {
                        console.error("Error in executeScript:", chrome.runtime.lastError.message);
                        return reject(`Script execution error: ${chrome.runtime.lastError.message}`);
                    }

                    if (!results || results.length === 0) {
                        console.error("No results returned from executeScript.");
                        return reject("Error: Failed to retrieve results from the page.");
                    }

                    const extractedContent = results[0]?.result; // Extracted content result
                    if (extractedContent && extractedContent.trim() !== "") {
                        console.log("Extracted Content:", extractedContent);
                        resolve(extractedContent); // Resolve with extracted content
                    } else {
                        console.error("No meaningful content extracted.");
                        reject("Error: Failed to extract meaningful content.");
                    }
                }
            );
        });
    });
}

/**
 * Sends the extracted content to the Gemini API for summarization.
 * Incorporates the "generationConfig" for more control.
 */
async function fetchSummary(articleContent) {
    const API_KEY = "AIzaSyChmbtA0ZpyDhoRXXOTeU9r7L5f7tRBU5Q";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    const geminiPrompt = "Summarize the content of the following text in a clear, coherent, and concise manner. Capture the essential points, key arguments, and any actionable insights in 3-5 sentences. Use plain, natural language with a neutral, professional tone, and ensure the summary flows logically without unnecessary details.";


    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: geminiPrompt + "\n\n" + articleContent,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    top_p: 0.9,
                },
            }),
        });

        const data = await response.json();
        console.log("Gemini API Response:", JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates.length > 0) {
            const summary = data.candidates[0]?.content?.parts?.[0]?.text || "No summary available.";
            return summary;
        } else {
            console.error("No candidates in response:", data);
            return "Failed to generate a summary. Please try again.";
        }
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "Error: Unable to fetch summary due to an API issue.";
    }
}

/**
 * Handles the "Summarize Page" button click event.
 * Extracts content, sends it to the API, and displays the summary.
 * Includes robust error handling for all stages.
 */
summarizeButton.addEventListener("click", async () => {
    summaryOutput.value = "Extracting content...";

    try {
        // Step 1: Extract the content
        const articleContent = await extractArticleContent();

        if (articleContent && articleContent.trim() && articleContent.trim() !== "Content not found.") {
            // Step 2: Pass the content to the Gemini API
            summaryOutput.value = "Generating summary... Please wait.";
            const summary = await fetchSummary(articleContent);
            summaryOutput.value = summary;
        } else {
            summaryOutput.value = "Error: No meaningful content could be extracted from this page.";
        }
    } catch (error) {
        console.error("Error during extraction or summarization:", error);
        summaryOutput.value = `Failed: ${error}`;
    }
});

// Add clipboard copy functionality
document.getElementById("copy-icon").addEventListener("click", () => {
    const summaryOutput = document.getElementById("summary-output");
    const textToCopy = summaryOutput.value;

    if (textToCopy.trim() === "") {
        alert("There's nothing to copy!");
        return;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            console.log("Summary copied to the clipboard!");
        })
        .catch((err) => {
            console.error("Error copying text: ", err);
            console.log("Unable to copy. Please try again.");
        });
});