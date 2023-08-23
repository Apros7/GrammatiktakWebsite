import { get_text } from "./retrieve_text.js";

export function simulateProgress(sentence) {
  document.getElementById("right-column").innerHTML = ""
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loading-screen");
  loadingScreen.id = "loading-screen"
  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  const rightColumn = document.querySelector('.text-and-recommendations .right-column');

  loadingScreen.appendChild(progressBar);
  rightColumn.appendChild(loadingScreen);

  const wordCount = sentence.split("").length;
  const intervalTime = (wordCount * 0.2) + 3;

  let width = 0;

  const interval = setInterval(() => {
    if (width >= 98) {
      clearInterval(interval);
      // Hide the loading screen once progress is complete
      document.getElementById("loading-screen").style.display = "none";
    } else {
      width++;
      progressBar.style.width = `${width}%`;
    }
  }, intervalTime);
  return interval
}

export function activate_spinner() {
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  rightColumn.innerHTML = "";
  const background = document.createElement("div");
  background.classList.add("spinner-background")
  const text = document.createElement("div");
  text.classList.add("spinner-text")
  text.innerText = "Vi retter din tekst..."
  const spinner = document.createElement("div");
  spinner.classList.add("spinner")
  // spinner.style.display = 'block';
  background.appendChild(spinner)
  background.appendChild(text)
  rightColumn.appendChild(background)
}

export function stop_spinner() {
  document.querySelector('.text-and-recommendations .right-column').innerHTML = "";
}

export function check_clear_message(sentence_information) {
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  const chunks = get_text().split("<br>")
  if (rightColumn.childElementCount === 0 && chunks.length === sentence_information.errors_from_backend.length) {
    rightColumn.innerHTML = ""
    let allClearText = document.createElement("div")
    allClearText.classList.add("allClearText")
    allClearText.textContent = "Det ser ud til, at din tekst er fejlfri 😊."
    rightColumn.appendChild(allClearText)
  }
}