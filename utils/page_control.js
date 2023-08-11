

export function set_margin() {
  const leftColumn = document.querySelector('.text-and-recommendations .left-column');
  const rightColumn = document.querySelector('.text-and-recommendations .right-column');
  const windowHeight = window.innerHeight;
  let totalHeight = 0
  if (leftColumn.offsetHeight > rightColumn.offsetHeight) {
    totalHeight += leftColumn.offsetHeight
  } else {
    totalHeight += rightColumn.offsetHeight
  }
  let value = 300
  let margin = windowHeight - value
  if (totalHeight > value) {
    margin = totalHeight + (windowHeight - 750)
  } 
  if (margin < totalHeight) {
    margin = totalHeight
  }
  document.querySelector('.text-and-recommendations').style.marginBottom = `${margin}px`;
}