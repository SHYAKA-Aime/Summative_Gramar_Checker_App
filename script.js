let originalErrors = [];
let originalText = '';
let correctedText = '';

async function checkGrammar() {
    const text = document.getElementById("inputText").value;
    const output = document.getElementById("output");
    const loading = document.getElementById("loading");

    // Clear previous results and highlights
    output.innerHTML = "";
    clearHighlights();
    
    // Hide corrected text section
    const correctedSection = document.getElementById("correctedSection");
    if (correctedSection) {
        correctedSection.style.display = "none";
    }

    if (!text.trim()) {
        output.innerHTML = "<p style='color:orange;'>Please enter some text to check.</p>";
        return;
    }

    // Store original text for highlighting
    originalText = text;
    
    loading.classList.remove("hidden");

    const url = 'https://textgears-textgears-v1.p.rapidapi.com/grammar';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': window.env.API_KEY,
            'x-rapidapi-host': window.env.API_HOST,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            text: text,
            language: 'en-US'
        })
    };

    try {
        console.log('Making API request...');
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API response:', result);
        
        const errors = result?.response?.errors;

        loading.classList.add("hidden");

        if (Array.isArray(errors) && errors.length > 0) {
            originalErrors = errors;
            renderSuggestions(errors);
            highlightErrors(errors);
            
            // Show auto-correct button
            showAutoCorrectButton();
        } else {
            output.innerHTML = "<p style='color:green; font-weight:bold;'>No grammatical errors found! 🎉</p>";
            hideAutoCorrectButton();
        }

    } catch (error) {
        loading.classList.add("hidden");
        console.error("Grammar check error:", error);
        output.innerHTML = `<p style='color:red;'>Error checking grammar: ${error.message}</p>`;
        hideAutoCorrectButton();
    }
}

function showAutoCorrectButton() {
    let autoCorrectBtn = document.getElementById("autoCorrectBtn");
    if (!autoCorrectBtn) {
        // Create the button if it doesn't exist
        autoCorrectBtn = document.createElement("button");
        autoCorrectBtn.id = "autoCorrectBtn";
        autoCorrectBtn.innerHTML = " Auto-Correct All";
        autoCorrectBtn.onclick = autoCorrectText;
        autoCorrectBtn.style.cssText = `
            background-color: #28a745;
            color: white;
            padding: 12px 16px;
            font-weight: 600;
            font-size: 15px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.3s ease;
            margin-top: 12px;
            width: 100%;
        `;
        
        // Insert after the controls section
        const controls = document.querySelector(".controls");
        controls.parentNode.insertBefore(autoCorrectBtn, controls.nextSibling);
    }
    autoCorrectBtn.style.display = "block";
}

function hideAutoCorrectButton() {
    const autoCorrectBtn = document.getElementById("autoCorrectBtn");
    if (autoCorrectBtn) {
        autoCorrectBtn.style.display = "none";
    }
}

function autoCorrectText() {
    if (originalErrors.length === 0) return;
    
    let text = originalText;
    
    // Sort errors by offset in descending order to maintain correct positions
    const sortedErrors = [...originalErrors].sort((a, b) => b.offset - a.offset);
    
    // Apply corrections from end to beginning
    sortedErrors.forEach(error => {
        if (error.better && error.better.length > 0) {
            const start = error.offset;
            const end = start + error.length;
            const replacement = error.better[0]; // Use first suggestion
            
            text = text.substring(0, start) + replacement + text.substring(end);
        }
    });
    
    correctedText = text;
    
    // Display the corrected text
    showCorrectedText(correctedText);
    
    // Clear highlights and errors since they're now corrected
    clearHighlights();
    document.getElementById("output").innerHTML = "<p style='color:green; font-weight:bold;'>All errors have been automatically corrected!</p>";
    hideAutoCorrectButton();
}

function showCorrectedText(text) {
    // Remove existing corrected section if it exists
    let correctedSection = document.getElementById("correctedSection");
    if (correctedSection) {
        correctedSection.remove();
    }
    
    // Create new corrected text section
    correctedSection = document.createElement("div");
    correctedSection.id = "correctedSection";
    correctedSection.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: #f8fff8;
        border: 2px solid #28a745;
        border-radius: 12px;
        position: relative;
    `;
    
    correctedSection.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="color: #28a745; margin: 0; font-size: 18px;"> Corrected Text</h3>
            <div style="display: flex; gap: 8px;">
                <button onclick="copyCorrectedText()" id="copyCorrectedBtn" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">Copy</button>
                <button onclick="replaceOriginalText()" id="replaceBtn" style="
                    background-color: #6f42c1;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">↩Replace Original</button>
            </div>
        </div>
        <div id="correctedTextDisplay" style="
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #d4edda;
            font-size: 16px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 200px;
            overflow-y: auto;
        ">${text}</div>
        <div id="correctedTooltip" style="
            position: absolute;
            top: -35px;
            right: 10px;
            background-color: #333;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        ">Copied!</div>
    `;
    
    // Insert after the output section
    const output = document.getElementById("output");
    output.parentNode.insertBefore(correctedSection, output.nextSibling);
}

function copyCorrectedText() {
    const tooltip = document.getElementById("correctedTooltip");
    
    navigator.clipboard.writeText(correctedText)
        .then(() => {
            tooltip.innerText = "Copied!";
            tooltip.style.opacity = "1";
            setTimeout(() => {
                tooltip.style.opacity = "0";
            }, 2000);
        })
        .catch(() => {
            tooltip.innerText = "Failed to copy!";
            tooltip.style.opacity = "1";
            setTimeout(() => {
                tooltip.style.opacity = "0";
            }, 2000);
        });
}

function replaceOriginalText() {
    const inputText = document.getElementById("inputText");
    inputText.value = correctedText;
    
    // Show success message
    const tooltip = document.getElementById("correctedTooltip");
    tooltip.innerText = "Text replaced!";
    tooltip.style.opacity = "1";
    setTimeout(() => {
        tooltip.style.opacity = "0";
    }, 2000);
}

function highlightErrors(errors) {
    const inputText = document.getElementById("inputText");
    const text = inputText.value;
    
    // Remove any existing wrapper first
    clearHighlights();
    
    // Get the computed styles of the textarea
    const textareaStyles = window.getComputedStyle(inputText);
    
    // Create a wrapper div for the highlighted content
    const wrapper = document.createElement("div");
    wrapper.id = "textHighlightWrapper";
    wrapper.style.cssText = `
        position: absolute;
        top: ${inputText.offsetTop}px;
        left: ${inputText.offsetLeft}px;
        width: ${inputText.offsetWidth}px;
        height: ${inputText.offsetHeight}px;
        padding: ${textareaStyles.padding};
        font-size: ${textareaStyles.fontSize};
        font-family: ${textareaStyles.fontFamily};
        line-height: ${textareaStyles.lineHeight};
        white-space: pre-wrap;
        word-wrap: break-word;
        pointer-events: none;
        color: transparent;
        background: transparent;
        border: ${textareaStyles.borderWidth} solid transparent;
        border-radius: ${textareaStyles.borderRadius};
        overflow: hidden;
        z-index: 1;
        margin: 0;
        box-sizing: ${textareaStyles.boxSizing};
        resize: none;
    `;
    
    // Insert wrapper as sibling to textarea
    inputText.parentNode.insertBefore(wrapper, inputText);
    
    // Modify textarea to be transparent background
    inputText.style.background = "transparent";
    inputText.style.position = "relative";
    inputText.style.zIndex = "2";
    
    // Sort errors by offset to handle overlapping correctly
    const sortedErrors = [...errors].sort((a, b) => a.offset - b.offset);
    
    let highlightedText = text;
    
    // Apply highlights from end to beginning to maintain correct positions
    for (let i = sortedErrors.length - 1; i >= 0; i--) {
        const error = sortedErrors[i];
        const start = error.offset;
        const end = start + error.length;
        const errorType = error.type;
        
        // Define highlight colors based on error type
        const highlightColor = errorType === 'spelling' ? '#ffe6e6' : '#e6f3ff';
        const borderColor = errorType === 'spelling' ? '#ff4444' : '#4488ff';
        
        const beforeText = highlightedText.substring(0, start);
        const errorText = highlightedText.substring(start, end);
        const afterText = highlightedText.substring(end);
        
        const highlightSpan = `<span style="background-color: ${highlightColor}; border-bottom: 2px solid ${borderColor}; border-radius: 2px;">${errorText}</span>`;
        
        highlightedText = beforeText + highlightSpan + afterText;
    }
    
    wrapper.innerHTML = highlightedText;
}

function clearHighlights() {
    const wrapper = document.getElementById("textHighlightWrapper");
    if (wrapper) {
        wrapper.remove();
    }
    
    // Reset textarea background
    const inputText = document.getElementById("inputText");
    if (inputText) {
        inputText.style.background = "#fafafa";
    }
}

function renderSuggestions(errors) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  errors.forEach(error => {
      const div = document.createElement("div");
      div.classList.add("error-card");
      div.setAttribute("data-type", error.type);

      div.innerHTML = `
          <div class="error-header">
            <span class="error-type ${error.type}">${error.type === "spelling" ? "Spelling" : "Grammar"}</span>
          </div>
          <div class="error-body">
            <p><strong>Issue:</strong> <span class="bad-word">${error.bad}</span></p>
            <p><strong>Suggestions:</strong> ${error.better.map(s => `<span class="suggestion">${s}</span>`).join('')}</p>
          </div>
      `;
      output.appendChild(div);
  });
}

function copySuggestions() {
    const outputDivs = document.querySelectorAll("#output div");
    const tooltip = document.getElementById("copyTooltip");

    if (outputDivs.length === 0) {
        tooltip.innerText = "No suggestions!";
        showTooltip();
        return;
    }

    let textToCopy = "";
    outputDivs.forEach(div => {
        textToCopy += div.innerText + "\n";
    });

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            tooltip.innerText = "Copied!";
            showTooltip();
        })
        .catch(() => {
            tooltip.innerText = "Failed to copy!";
            showTooltip();
        });
}

function showTooltip() {
    const tooltip = document.getElementById("copyTooltip");
    tooltip.classList.add("show");

    setTimeout(() => {
        tooltip.classList.remove("show");
    }, 2000);
}

function filterSuggestions() {
    const selected = document.getElementById("filter").value;
    let filtered = [];

    if (selected === "all") {
        filtered = originalErrors;
    } else {
        filtered = originalErrors.filter(e => e.type === selected);
    }

    renderSuggestions(filtered);
    // Re-highlight with filtered errors
    highlightErrors(filtered);
}

function clearAll() {
    document.getElementById("inputText").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("filter").value = "all";
    originalErrors = [];
    originalText = '';
    correctedText = '';
    clearHighlights();
    hideAutoCorrectButton();
    
    // Remove corrected text section
    const correctedSection = document.getElementById("correctedSection");
    if (correctedSection) {
        correctedSection.remove();
    }
}