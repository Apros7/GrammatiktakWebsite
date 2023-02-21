
//let service_url = "http://127.0.0.1:5000/";
let service_url = "https://backend1-2f53ohkurq-ey.a.run.app";

let errors = []
let originalText = "dette er din tekst"

function splitWords(sentence) {
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

function get_text() {
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

document.addEventListener("DOMContentLoaded", function() {
  var text = document.querySelector(".text");
  text.addEventListener("paste", function(e) {
    e.preventDefault();
    var current_text = e.clipboardData.getData("text/plain");
    var html = current_text.replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, html);
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
  const textWhenCorrection = splitWords(get_text())
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

async function fetchData() {
  if (splitWords(get_text()).length > 1000) {
    return "error"
  }
  let object = {"sentence": get_text()};
  const response = await fetch(service_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  });
  const data = await response.text();
  errors = JSON.parse(data.replace(/\\u([a-f0-9]{4})/gi, (match, group) => String.fromCharCode(parseInt(group, 16))));;
  return "succes"
}

async function main(textWhenCorrection) {

  state = await fetchData();
  if (state === "error") {
    error_message = document.querySelector(".error-message")
    error_message.innerHTML = "Vi kan desværre ikke rette over 1000 ord på nuværende tidspunkt. Vi beklager meget!"
  }

  let corrected_errors = []

  const words = splitWords(get_text())

  for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const index = error[2];
      words[index] = `<span style="color: red">${words[index]}</span>`;
    }

  const currentText = document.querySelector(".text")
  currentText.innerHTML = words.join(" ")

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
          const index = errors[i][2];
          const words = splitWords(get_text())
          if (!arraysEqual(textWhenCorrection, words)) {
            correctText();
            return;
          }
          corrected_errors.push(i)
          if (errors[i][3] === `Der skal være punktum efter "${errors[i][0]}".`)
            corrected_errors.push(i+1)
            const nextErrorMessage = errorMessage.nextElementSibling;
            if (nextErrorMessage) {
              nextErrorMessage.remove();
            }
          for (let j = 0; j < errors.length; j++) {
              if (j !== i && !corrected_errors.includes(j)) {
                const errorIndex = errors[j][2];
                words[errorIndex] = `<span style="color: red">${words[errorIndex]}</span>`;
              }
            }
          currentText.innerHTML = words.join(" ")
          errorMessage.remove();
          checkClearMessage();
        });

      const wrongWord = document.createElement("div");
      wrongWord.classList.add("wrongWord")
      wrongWord.textContent = error[0].replace(/<br>/g, "");
      errorMessage.append(wrongWord)

      const arrow = document.createElement("div");
      arrow.classList.add("arrow")
      arrow.innerHTML = "&#8594;"
      errorMessage.append(arrow)

      const correctWord = document.createElement("div");
      correctWord.classList.add("correctWord")
      correctWord.textContent = error[1].replace(/<br>/g, "");
      errorMessage.append(correctWord)

      correctWord.addEventListener("click", function() {
          const index = errors[i][2];
          const words = splitWords(get_text())
          if (!arraysEqual(textWhenCorrection, words)) {
            correctText();
            return;
          }
          words[index] = errors[i][1];
          corrected_errors.push(i)
          for (let j = 0; j < errors.length; j++) {
              if (j !== i && !corrected_errors.includes(j)) {
                const errorIndex = errors[j][2];
                words[errorIndex] = `<span style="color: red">${words[errorIndex]}</span>`;
              }
            }
          currentText.innerHTML = words.join(" ")
          errorMessage.remove();
          checkClearMessage();
        });

      const errorElement = document.createElement("div");
      errorElement.classList.add("description");
      errorElement.textContent = error[3]
      errorMessage.append(errorElement)

      rightColumn.appendChild(errorMessage)
  }

correctTextButton.textContent = "Ret min tekst";
}

