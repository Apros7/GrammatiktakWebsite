
let service_url = "http://127.0.0.1:5000/";
//let service_url = "https://backend1-2f53ohkurq-ey.a.run.app";

let errors = []
let originalText = "dette er din tekst"

function splitWords(sentence) {
  return sentence
}

function splitWords2(sentence) {
  sentence = sentence.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  let words = sentence.split(' '); 
  let true_words = [];
  let result = []; 
  const symbols = ".,!?\";:"
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (symbols.includes(word[0]) || symbols.includes(word[-1])) {
      if (i == 0) {
        words[1] = word + " " + words[i]
      } else {
        const lastElement = true_words[true_words.length - 1]
        let elements = [lastElement]
        let pushWord = ""
        if (symbols.includes(word[0])) {
          elements.push(word[0]) 
          pushWord = word.substring(1)
        } else {
          elements.push(word[-1])
          pushWord = word.substring(0, word.length - 1)
        }
        true_words.splice(true_words.length - 1, 1, elements.join(" "))
        true_words.push(pushWord)
      }
    } else {
      true_words.push(word)
    }
  }
  for (let i = 0; i < true_words.length; i++) {
    const word = true_words[i];
    if (word.includes('<br>')) { 
      const [left, right] = word.split('<br>');
      if (left === "" || right === "") {
        result.push(word)
      } else {
        result.push(left + '<br>'); 
        result.push(right); 
      }
    } else {
      result.push(word); 
    }
  }
  result = result.filter(str => str !== "");
  return result; 
}

function set_margin() {
  const leftColumn = document.querySelector('.text-and-recommendations .left-column');
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  const windowHeight = window.innerHeight;
  let totalHeight = 0
  if (leftColumn.offsetHeight > rightColumn.offsetHeight) {
    totalHeight += leftColumn.offsetHeight
  } else {
    totalHeight += rightColumn.offsetHeight
  }
  let margin = windowHeight - 400
  if (totalHeight > 400) {
    margin = totalHeight + (windowHeight - 750)
  } 
  if (margin < totalHeight) {
    margin = totalHeight
  }
  document.querySelector('.text-and-recommendations').style.marginBottom = `${margin}px`;
}

set_margin()

function get_text() {
  set_margin()
  const text = document.querySelector(".text");
  const current_text = check_font();
  let html = current_text.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  html = html.replace(/<div>/g, match => {
    return "<br>"
  });
  html = html.replace(/<\/div>/g, '');
  html = html.replace(/&nbsp;/g, '');
  return html;
}

function check_font() {
  var text = document.querySelector(".text");
  var current_text = text.innerHTML.replace(/<font.*?>/g, '').replace(/<\/font>/g, '');
  text.innerHTML = current_text;
  return current_text;
}

function correct_sentence(sentence, string_to_put_in, start_index, end_index, errors) {
  const corrected_sentence = sentence.slice(0, start_index) + string_to_put_in + sentence.slice(end_index)
  if (end_index !== start_index + string_to_put_in.length) {
    const difference = start_index + string_to_put_in.length - end_index
    for (let i = 0; i < errors.length; i++) {
      if (errors[i][2][0] > start_index) {
        errors[i][2][0] = errors[i][2][0] + difference
        errors[i][2][1] = errors[i][2][1] + difference
      }
    }
   }
  return [corrected_sentence, errors]
}

const divElement = document.querySelector('#text');
const observer = new MutationObserver(() => {
  // Call the set_margin() function whenever a change is detected
  set_margin();
});
observer.observe(divElement, { childList: true, characterData: true, subtree: true });

function make_sentence_red(sentence, string_to_put_in, indexes) {
  let result = "";
  let previousIndex = 0;
  for (let i = 0; i < indexes.length; i++) {
    const [start, end] = indexes[i];
    result += sentence.slice(previousIndex, start);
    result += `<span style="color: red">${string_to_put_in[i]}</span>`;
    previousIndex = end;
  }
  result += sentence.slice(previousIndex);
  return result;
}

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

text.addEventListener('input', () => {
  // If the editable div is empty, show the overlay element
  if (text.textContent.trim() === '') {
    placeholder.style.display = 'flex';
    text.style.marginTop = "-3.2em";
  } else {
    placeholder.style.display = 'none';
    text.style.marginTop = "0";
  }
});

const correctTextButton = document.querySelector(".submit-button")

function correctText() {
  const rightColumn = document.querySelector(".right-column");
  let textWhenCorrection = splitWords(get_text())
  rightColumn.innerHTML = "";
  correctTextButton.textContent = "Retter din tekst...";
  main(textWhenCorrection);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

correctTextButton.addEventListener("click", () => {
  correctText();
})

const copyButton = document.querySelector(".copy-button");

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

function fetchFeedback() {
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

async function fetchData() {
  if (splitWords(get_text()).length > 5000) {
    return "error"
  }
  let object = {"sentence": get_text(), "feedback": null};
  const response = await fetch(service_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  });
  const data = await response.text();
  console.log(data, data.length)
  errors = JSON.parse(data.replace(/\\u([a-f0-9]{4})/gi, (match, group) => String.fromCharCode(parseInt(group, 16))));
  return "success"
}

async function main(textWhenCorrection) {

  state = await fetchData();
  if (state === "error") {
    error_message = document.querySelector(".error-message")
    error_message.innerHTML = "Vi kan desværre ikke rette over 5000 tegn på nuværende tidspunkt. Vi beklager meget!"
  }

  let corrected_errors = []

  let sentence = splitWords(get_text())
  let str_to_put_in = []
  let indexes = []

  for (let i = 0; i < errors.length; i++) {
      const word = errors[i][0];
      const lower_bound = errors[i][2][0]
      const upper_bound = errors[i][2][1]
      str_to_put_in.push(`<span style="color: red">${word}</span>`);
      indexes.push([lower_bound, upper_bound])
  }

  sentence = make_sentence_red(sentence, str_to_put_in, indexes);
  const currentText = document.querySelector(".text")
  currentText.innerHTML = sentence

  const rightColumn = document.querySelector(".right-column")

  function checkClearMessage() {
      if (rightColumn.childElementCount === 0) {
          allClearText = document.createElement("div")
          allClearText.classList.add("allClearText")
          allClearText.textContent = "Det ser ud til, at din tekst er fejlfri 😊."
          rightColumn.appendChild(allClearText)
        }
  }

  if (errors.length === 0) {
      allClearText = document.createElement("div")
      allClearText.classList.add("allClearText")
      allClearText.textContent = "Det ser ud til, at din tekst er fejlfri 😊."
      rightColumn.appendChild(allClearText)
  }

  for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      
      const errorMessage = document.createElement("div");
      errorMessage.classList.add("error-message");

      const closeButton = document.createElement("div");
      closeButton.classList.add("close-button");
      closeButton.textContent = "X";
      errorMessage.append(closeButton)

      closeButton.addEventListener("click", function() {
        const sentence = splitWords(get_text())
        if (!(textWhenCorrection === sentence)) {
          correctText();
          return;
        }
        let str_to_put_in = []
        let indexes = []
        corrected_errors.push(i)
        for (let j = 0; j < errors.length; j++) {
            if (j !== i && !corrected_errors.includes(j)) {
              const word = errors[j][0];
              const lower_bound = errors[j][2][0]
              const upper_bound = errors[j][2][1]
              str_to_put_in.push(`<span style="color: red">${word}</span>`);
              indexes.push([lower_bound, upper_bound])
            }
        }
        const red_sentence = make_sentence_red(sentence, str_to_put_in, indexes);
        textWhenCorrection = sentence;
        currentText.innerHTML = red_sentence
        errorMessage.remove();
        checkClearMessage();
        set_margin()
        });

      const wrongWord = document.createElement("div");
      wrongWord.classList.add("wrongWord")
      wrongWord.textContent = error[0];
      errorMessage.append(wrongWord)

      const arrow = document.createElement("div");
      arrow.classList.add("arrow")
      arrow.innerHTML = "&#8594;"
      errorMessage.append(arrow)

      const correctWord = document.createElement("div");
      correctWord.classList.add("correctWord")
      correctWord.textContent = error[1];
      errorMessage.append(correctWord)

      correctWord.addEventListener("click", function() {
        let sentence = splitWords(get_text())
        if (!(textWhenCorrection === sentence)) {
         correctText();
          return;
        }
        let str_to_put_in = []
        let indexes = []
        corrected_errors.push(i)
        const correction = correct_sentence(sentence, error[1], error[2][0], error[2][1], errors);
        sentence = correction[0];
        errors = correction[1];
        for (let j = 0; j < errors.length; j++) {
            if (j !== i && !corrected_errors.includes(j)) {
              const word = errors[j][0];
              const lower_bound = errors[j][2][0]
              const upper_bound = errors[j][2][1]
              str_to_put_in.push(`<span style="color: red">${word}</span>`);
              indexes.push([lower_bound, upper_bound])
            }
        }
        const red_sentence = make_sentence_red(sentence, str_to_put_in, indexes);
        textWhenCorrection = sentence;
        currentText.innerHTML = red_sentence
        errorMessage.remove();
        checkClearMessage();
        set_margin()
        });

      const errorElement = document.createElement("div");
      errorElement.classList.add("description");
      errorElement.textContent = error[3]
      errorMessage.append(errorElement)

      rightColumn.appendChild(errorMessage)

      set_margin()
  }

correctTextButton.textContent = "Ret min tekst";
}

