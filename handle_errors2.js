
import { set_margin } from "utils/page_control.js";
import { get_text } from "utils/retrieve_text.js";
import { correct_sentence } from "utils/correct_text.js";
import { fetchData, fetchFeedback, handle_fetching_error } from "utils/fetching.js"

// let service_url = "http://127.0.0.1:5000/";
let service_url = "https://backend1-2f53ohkurq-ey.a.run.app";

let errors = []
let originalText = "dette er din tekst"
let sentence_information = {
    text_at_correction_time: "",
    current_text: ""
}

set_margin()

// Call the set_margin() function whenever a change is detected
const divElement = document.querySelector('#text');
const observer = new MutationObserver(() => {
  set_margin();
});
observer.observe(divElement, { childList: true, characterData: true, subtree: true });

// Feedback button logic and pasting text
document.addEventListener("DOMContentLoaded", function() {
    const feedbackButton = document.querySelector(".feedback-button");
    feedbackButton.addEventListener("click", () => {
      feedbackButton.innerText = "Sender..."
      setTimeout(() => {
        feedbackButton.innerText = "Mange tak for din feedback!";
      }, 1000);
      fetchFeedback();
      const feedbackField = document.querySelector(".feedback-text");
      feedbackField.innerText = ""
      setTimeout(() => {
        feedbackButton.innerText = "Indsend feedback";
      }, 3000);
    });
  
    var text = document.querySelector(".text");
    text.addEventListener("paste", function(e) {
      e.preventDefault();
      var current_text = e.clipboardData.getData("text/plain");
      var html = current_text.replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, html);
      set_margin()
    });
});

const text = document.querySelector(".text")
const placeholder = document.querySelector(".placeholder")
const correctTextButton = document.querySelector(".submit-button")
const copyButton = document.querySelector(".copy-button");
const rightColumn = document.querySelector(".right-column");

copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(document.querySelector(".text").innerText).then(() => {
      copyButton.innerText = "Kopieret";
      setTimeout(() => {
        copyButton.innerText = "Kopier tekst";
      }, 2000);
    }, (err) => {
      console.log('Failed to copy text: ', err);
    });
  });

correctTextButton.addEventListener("click", () => {
    correct_text();
  })

// code for clear and back button:
back_button = document.querySelector(".back-button");
clear_button = document.querySelector(".clear-button");

let previous_text = "";

clear_button.addEventListener("click", () => {
  previous_text = get_text();
  back_button.style.display = "block";
  text.innerHTML = "";
})

back_button.addEventListener("click", () => {
  text.innerHTML = previous_text
  previous_text = "";
  back_button.style.display = "none";
})

// If the editable div is empty, show the overlay element
text.addEventListener('input', () => {
    if (text.textContent.trim() === '') {
      placeholder.style.display = 'flex';
      text.style.marginTop = "-3.2em";
    } else {
      placeholder.style.display = 'none';
      text.style.marginTop = "0";
    }
});

function correct_text() {
    let text_at_correction_time = get_text();
    rightColumn.innerHTML = "";
    correctTextButton.textContent = "Retter din tekst...";
    main(text_at_correction_time);
}

async function main(text_at_correction_time) {
    progress_interval = simulateProgress(text_at_correction_time);
    errors = await fetchData()
    clearInterval(progress_interval)
    document.getElementById("loading-screen").style.display = "none";
    handle_fetching_error(errors)

    let corrected_errors = []
    let sentence = get_text()
    let str_to_put_in = []
    let indexes = []
    

    return null;
}

// One error could be from RightColumn being declared outside of functions instead of in each one