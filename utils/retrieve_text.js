import { set_margin } from "./page_control.js";

export function get_text() {
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