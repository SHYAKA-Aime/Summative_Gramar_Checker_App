let originalErrors = [];

async function checkGrammar() {
  const text = document.getElementById("inputText").value;
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");

  output.innerHTML = "";
  loading.classList.remove("hidden");

  const url = 'https://textgears-textgears-v1.p.rapidapi.com/grammar';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'c37ba5b7f3msh894a710f3613488p1573c4jsn56df121b9e22',
      'x-rapidapi-host': 'textgears-textgears-v1.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      text: text,
      language: 'en-US'
    })
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const errors = result?.response?.errors;

    loading.classList.add("hidden");

    if (Array.isArray(errors) && errors.length > 0) {
      originalErrors = errors; 
      renderSuggestions(errors);
    } else {
      output.innerHTML = "<p style='color:green; font-weight:bold;'>No grammatical errors found! 🎉</p>";
    }

  } catch (error) {
    loading.classList.add("hidden");
    console.error("Grammar check error:", error);
    output.innerHTML = "<p style='color:red;'>Error checking grammar. Please try again.</p>";
  }
}

function renderSuggestions(errors) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  errors.forEach(error => {
    const div = document.createElement("div");
    div.setAttribute("data-type", error.type); 
    div.innerHTML = `
      <p><strong>Issue:</strong> ${error.bad}</p>
      <p><strong>Suggestion:</strong> ${error.better.join(', ')}</p>
      <p><strong>Type:</strong> ${error.type}</p>
      <hr>`;
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
}

function clearAll() {
  document.getElementById("inputText").value = "";
  document.getElementById("output").innerHTML = "";
  document.getElementById("filter").value = "all";
  originalErrors = [];
}
