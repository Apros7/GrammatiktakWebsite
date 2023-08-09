import { get_text } from "retrieve_text.js";

function fetchFeedback(service_url) {
    const feedback = document.querySelector(".feedback-text").innerText;
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