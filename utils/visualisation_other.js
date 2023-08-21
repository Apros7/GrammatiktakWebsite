
export function simulateProgress(sentence) {
  const loadingScreen = document.createElement("div");
  loadingScreen.classList.add("loading-screen");
  loadingScreen.id = "loading-screen"
  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  const rightColumn = document.querySelector('.text-and-recommendations .right-column');

  loadingScreen.appendChild(progressBar);
  rightColumn.appendChild(loadingScreen);

  const wordCount = sentence.split("").length;
  const intervalTime = (wordCount * 0.35) + 3;

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

export function check_clear_message() {
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  if (rightColumn.childElementCount === 0) {
    let allClearText = document.createElement("div")
    allClearText.classList.add("allClearText")
    allClearText.textContent = "Det ser ud til, at din tekst er fejlfri 😊."
    rightColumn.appendChild(allClearText)
  }
}