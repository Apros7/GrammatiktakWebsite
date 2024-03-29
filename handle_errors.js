import { set_margin } from "/utils/page_control.js";
import { get_text } from "/utils/retrieve_text.js";
import { fetchData, fetchFeedback } from "/utils/fetching.js"
import { init_make_sentence_red, VisualError, should_visualize_id } from "/utils/visualisation_errors.js";
import { check_clear_message, simulateProgress, activate_spinner, stop_spinner } from "/utils/visualisation_other.js"
import { unnestErrors } from "/utils/helper_functions.js"
import { initalize_input_and_button } from "/utils/school_code_helpers.js"

// let service_url = "http://127.0.0.1:5000/";
let service_url = "https://backend1-2f53ohkurq-ey.a.run.app";

let errors = []
let originalText = "dette er din tekst"
let cursor_position = 5
let sentence_information = {
    text_at_correction_time: "",
    current_text: "",
    corrected_errors: [],
    errors_from_backend: [],
    removed_error_ids: [],
    previous_chunks: [],
    errors_matching_text: {},
    waiting_for_backend: {},
}

set_margin()
initalize_input_and_button()

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
      fetchFeedback(service_url);
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
const textUnderline = document.getElementById("text-underline")
const placeholder = document.querySelector(".placeholder")
const copyButton = document.querySelector(".copy-button");
const rightColumn = document.querySelector(".right-column");

setInterval(() => {
  if (text.innerHTML.trim() === '') {
    textUnderline.style.marginTop = '-3.2em'
  } else {
    textUnderline.style.marginTop = '0em'
  }
}, 10)

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

// code for clear and back button:
const back_button = document.querySelector(".back-button");
const clear_button = document.querySelector(".clear-button");

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

function get_unique_errors(errors) {
  var uniqueItems = {};
  var uniqueList = errors.filter(function(item) {
    var key = item.slice(0, 4).join(","); 
    if (!uniqueItems[key]) { uniqueItems[key] = true; return true; }
    return false;
  });
  return uniqueList
}

export async function display_errors() {
  let errors = await unnestErrors(sentence_information)
  let uniqueErrors = get_unique_errors(errors)
  rightColumn.innerHTML = "";

  const red_sentence = await init_make_sentence_red(get_text(), uniqueErrors)
  textUnderline.innerHTML = red_sentence
  for (let i = 0; i < uniqueErrors.length; i++) {
    const visualErrorInstance = new VisualError(uniqueErrors[i], sentence_information, i)
    if (should_visualize_id(visualErrorInstance)) {
      rightColumn.append(visualErrorInstance.visual_representation)
    }
  }
  
  check_clear_message(sentence_information)
  set_margin()
}

async function check_each_chunk() {
  const chunks = get_text().split("<br>")
  sentence_information.errors_from_backend = []

  let checked_chunks = []
  let not_checked_chunks = []

  for (let i = 0; i < chunks.length; i++) {
    let foundInPreviousChunks = false;

    for (let j = 0; j < sentence_information.previous_chunks.length; j++) {
      if (chunks[i] === sentence_information.previous_chunks[j]) {
        foundInPreviousChunks = true;
        break;
      }
    }

    if (chunks[i].trim().length === 0) {
      checked_chunks.push("")
      sentence_information.errors_from_backend.push([])
    }
    else if (foundInPreviousChunks) {
      checked_chunks.push(chunks[i]);
      const matching_errors = sentence_information.errors_matching_text[chunks[i]]
      sentence_information.errors_from_backend.push(matching_errors)
    } else {
      not_checked_chunks.push(chunks[i]);
      let errors = []
      if (!sentence_information.waiting_for_backend[chunks[i]]) {
        sentence_information.waiting_for_backend[chunks[i]] = true
        errors = await fetchData(service_url, chunks[i], sentence_information)
      } else {
        continue
      }
      // sentence_information.errors_matching_text[chunks[i]] = errors
      const currentTextContent = await get_text().split("<br>")
      if (currentTextContent.length !== chunks.length || currentTextContent[i] !== chunks[i]) {
        continue;
      }
      sentence_information.errors_from_backend.push(errors)
    }
  }
  sentence_information.previous_chunks = checked_chunks.concat(not_checked_chunks);
  
  // bug with errors being undefined.
  if (sentence_information.previous_chunks.length === sentence_information.errors_from_backend.length) {
    let new_prev_chunks = []
    for (let i = 0; i < checked_chunks.concat(not_checked_chunks).length; i++) {
      if (typeof sentence_information.errors_from_backend[i] !== "undefined") {
        new_prev_chunks.push(sentence_information.previous_chunks[i])
      }
    }
    sentence_information.previous_chunks = new_prev_chunks
  }


  // display errors if all done with fetching
  // const text_not_changed = JSON.stringify(get_text().split("<br>")) === JSON.stringify(chunks) && chunks.length === sentence_information.errors_from_backend.length
  // const waiting_for_backend = Object.values(sentence_information.waiting_for_backend).some(value => value);
  // if (text_not_changed && !waiting_for_backend) { 
  if (sentence_information.errors_from_backend.length > 0) {
    display_errors()
  }
  sentence_information.text_at_correction_time = sentence_information.previous_chunks.join("<br>")

  return [checked_chunks, not_checked_chunks]
}

function only_clear_text_in_right_column(rightColumn) {
  if (rightColumn.childElementCount === 1) {
    const childElement = rightColumn.firstElementChild;
    if (childElement.classList.contains('allClearText')) { return true }
  }
  return false
}

export async function auto_check_text() {
  const waiting = Object.values(sentence_information.waiting_for_backend).some(value => value);
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  if ((rightColumn.childElementCount === 0 || only_clear_text_in_right_column(rightColumn)) && waiting) {
    activate_spinner()
  }
  check_clear_message(sentence_information)
  let [checked, not_checked] = await check_each_chunk() 
}


// functions that should continously be run to check various functions of the page
setInterval(auto_check_text, 1000); // spinner vs. clear text
