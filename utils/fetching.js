import { get_text } from "retrieve_text.js";

function fetchFeedback(service_url, feedback = null) {
    if (feedback === null) {feedback = document.querySelector(".feedback-text").innerText;}
    let object = {"sentence": get_text(), "feedback": feedback};
    fetch(service_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    });
}

async function fetchData(service_url) {
    let object = {"sentence": get_text(), "feedback": null};
    const response = await fetch(service_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    });
    if (!response.ok) {
      return "error"
    }
    const data = await response.text();
    errors = JSON.parse(data.replace(/\\u([a-f0-9]{4})/gi, (match, group) => String.fromCharCode(parseInt(group, 16))));
    return errors
}

function create_fetching_error_message() {
    const rightColumn = document.querySelector(".right-column");
    document.getElementById("loading-screen").style.display = "none";
    errorText = document.createElement("div")
    errorText.classList.add("errorText")
    errorText.textContent = "Der er desværre sket en fejl på vores side. \nVi er opmærksomme på fejlen og retter den hurtigst muligt!"
    rightColumn.appendChild(errorText)
}

function handle_fetching_error(status, service_url) {
    if (status !== "error") {return status}
    create_fetching_error_message()
    const correctTextButton = document.querySelector(".submit-button")
    correctTextButton.textContent = "Ret min tekst";
    // sent auto feedback in case of error
    fetchFeedback(service_url, feedback="Automatic Feedback: Text Failed")
}