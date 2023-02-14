

let service_url = "http://127.0.0.1:5000/";
// let service_url = "https://backend1-2f53ohkurq-ey.a.run.app";
//let errors = [["he", "hej", 0, "beskrivelse"], ["heder", "hedder", 2, "beskrivelse"], ["lucas", "Lucas", 3, "beskrivelse"]]


let errors = []
let originalText = "dette er din tekst"

function splitWords(sentence) {
  sentence = sentence.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  const words = sentence.split(' '); // split the sentence into words
  let result = []; // initialize the result list
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.includes('<div>')) { // check if the word contains <div>
      const [left, right] = word.split('<div>'); // split the word into two parts
      result.push(left + '<div>'); // add the left part with <div> to the result list
      result.push(right); // add the right part to the result list
    } else {
      result.push(word); // add the word to the result list as is
    }
  }
  result = result.filter(str => str !== "");
  console.log("result", result)
  return result; // return the result list
}

function get_text() {
  const text = document.querySelector(".text");
  const html = text.innerHTML.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  console.log(html);
  return html;
}


const correctTextButton = document.querySelector(".submit-button")

correctTextButton.addEventListener("click", () => {
  const rightColumn = document.querySelector(".right-column");
  rightColumn.innerHTML = "";
  correctTextButton.textContent = "Retter din tekst...";
  main();
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
  originalText = await get_text();
  if (splitWords(originalText).length > 100) {
    return "error"
  }
  let object = {"sentence": originalText};
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

async function main() {

  state = await fetchData();
  if (state === "error") {
    error_message = document.querySelector(".error-message")
    error_message.innerHTML = "Vi kan desværre ikke rette over 100 ord på nuværende tidspunkt. Vi beklager meget!"
  }

  let corrected_errors = []

  const words = splitWords(document.querySelector(".text").innerHTML)

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

      const wrongWord = document.createElement("div");
      wrongWord.classList.add("wrongWord")
      wrongWord.textContent = error[0].replace(/<\/?div>/g, "");
      errorMessage.append(wrongWord)

      const arrow = document.createElement("div");
      arrow.classList.add("arrow")
      arrow.innerHTML = "&#8594;"
      errorMessage.append(arrow)

      const correctWord = document.createElement("div");
      correctWord.classList.add("correctWord")
      correctWord.textContent = error[1].replace(/<\/?div>/g, "");
      errorMessage.append(correctWord)

      correctWord.addEventListener("click", function() {
          const index = errors[i][2];
          const words = splitWords(get_text())
          words[index] = errors[i][1];
          corrected_errors.push(i)
          for (let j = 0; j < errors.length; j++) {
              if (j !== i && !corrected_errors.includes(j)) {
                const errorIndex = errors[j][2];
                words[errorIndex] = `<span style="color: red">${words[errorIndex]}</span>`;
              }
            }
          console.log(words)
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

