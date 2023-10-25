import { set_margin } from "./page_control.js";

export function get_text() {
  const current_text = check_font();
  let html = current_text.replace(/&nbsp;/g, ' ').replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
  if (html.substring(0, 5) === "<div>") {
    html = html.substring(5)
  }
  html = html.replace(/<div><br>/g, match => { return "<br>" })
  html = html.replace(/<div>/g, match => { return "<br>" });
  html = html.replace(/<\/div>/g, '').replace(/&nbsp;/g, '');
  return html;
}

function check_font() {
  var text = document.querySelector(".text");
  var current_text = text.innerHTML.replace(/<font.*?>/g, '').replace(/<\/font>/g, '');
  return current_text;
}