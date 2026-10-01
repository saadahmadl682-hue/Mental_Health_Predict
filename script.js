const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("predictionForm");
const button = document.getElementById("predictButton");
const errorBox = document.getElementById("errorBox");
const scoreValue = document.getElementById("scoreValue");
const scoreRing = document.getElementById("scoreRing");
const resultMessage = document.getElementById("resultMessage");
const apiStatus = document.getElementById("apiStatus");

function value(id) {
  return document.getElementById(id).value;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.remove("show");
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);
  apiStatus.textContent = isLoading ? "Processing" : "Waiting";
}

function setScore(score) {
  const numericScore = Number(score);
  scoreValue.textContent = Number.isInteger(numericScore)
    ? numericScore
    : numericScore.toFixed(2);

  // Visual-only progress ring. It is not an assumption about the model's score scale.
  const visualProgress = Math.min(Math.max(numericScore * 20, 0), 360);
  scoreRing.style.setProperty("--progress", `${visualProgress}deg`);

  resultMessage.innerHTML = `
    <strong>Prediction generated.</strong>
    <span>Your model returned a mental health score of <b>${scoreValue.textContent}</b>.</span>
  `;
  apiStatus.textContent = "Connected";
}

function buildPayload() {
  return {
    Age: Number(value("Age")),
    Gender: value("Gender"),
    Country: value("Country").trim(),
    Academic_Level: value("Academic_Level"),
    Most_Used_Platform: value("Most_Used_Platform"),
    Purpose_Of_Use: value("Purpose_Of_Use"),
    Avg_Daily_Usage_Hours: Number(value("Avg_Daily_Usage_Hours")),
    Daily_Unlocks: Number(value("Daily_Unlocks")),
    Study_Hours: Number(value("Study_Hours")),
    Physical_Activity_Hours: Number(value("Physical_Activity_Hours")),
    Sleep_Hours_Per_Night: Number(value("Sleep_Hours_Per_Night")),
    Stress_Level: value("Stress_Level")
  };
}

function explainApiError(errorData) {
  if (Array.isArray(errorData?.detail)) {
    return errorData.detail.map(item => {
      const location = Array.isArray(item.loc) ? item.loc.join(" → ") : "input";
      return `${location}: ${item.msg}`;
    }).join(" | ");
  }

  if (typeof errorData?.detail === "string") {
    return errorData.detail;
  }

  return "The API rejected the request. Please check your values and try again.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = buildPayload();
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(explainApiError(data));
    }

    if (typeof data.mental_health_score !== "number") {
      throw new Error("The API response did not contain a valid mental_health_score.");
    }

    setScore(data.mental_health_score);
  } catch (error) {
    apiStatus.textContent = "Error";
    showError(
      error.name === "TypeError"
        ? "Could not connect to FastAPI. Make sure your server is running at http://127.0.0.1:8000."
        : error.message
    );
  } finally {
    setLoading(false);
  }
});
