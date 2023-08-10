import { set_margin } from "page_control.js";
import { check_clear_message } from "visualisation_other.js"
import { correct_text } from "../handle_errors2.js"

function make_sentence_red(sentence, string_to_put_in, indexes) {
    const emojiIndexes = findEmojiIndexes(sentence);
    let result = "";
    let previousIndex = 0;
    const markedIndexes = [];
    for (let i = 0; i < indexes.length; i++) {
      let [start, end] = indexes[i];
      for (const j in emojiIndexes) {
        const value = emojiIndexes[j]
        if (value < start) {
          start += 1
          end += 1
        }
        else if (value > start && value < end) {
          end += 1
        }
      }
      if (!markedIndexes.includes(start)) {
        result += sentence.slice(previousIndex, start);
        result += string_to_put_in[i];
        previousIndex = end;
        markedIndexes.push(start);
      }
    }
    result += sentence.slice(previousIndex);
    return result;
  }

// Sentence information is an object as it allows for change without reinitilizing
// Has to include text_at_correction_time, current_text, corrected_errors

class VisualError {
  constructor(error, sentence_information) {
    this.wrong_word = error[0]
    this.right_word = error[1]
    this.indexes = error[2]
    this.description = error[3]
    this.sentence_information = sentence_information
    this.visual_representation = document.createElement("div")
    this.visual_representation.classList.add("error-message")
  }

  init_visual_representation() {
    this.visual_representation.append(this.create_close_button())
    this.visual_representation.append(this.create_wrong_word())
    this.visual_representation.append(this.create_arrow())
    this.visual_representation.append(this.create_right_word())
    this.visual_representation.append(this.create_description())
  }

  create_close_button() {
    // Still needs testing
    const closeButton = document.createElement("div");
    closeButton.classList.add("close-button");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", function() {
      if (!(this.sentence_information.text_at_correct_time === this.sentence_information.current_text)) {
        correct_text()
        return;
      }
      let str_to_put_in = []
      let indexes = []
      this.sentence_information.corrected_errors.push(i)
      for (let j = 0; j < errors.length; j++) {
          if (j !== i && !this.sentence_information.corrected_errors.includes(j)) {
            const word = errors[j][0];
            const lower_bound = errors[j][2][0]
            const upper_bound = errors[j][2][1]
            str_to_put_in.push(`<span style="color: red">${sentence.slice(lower_bound, upper_bound)}</span>`);
            indexes.push([lower_bound, upper_bound])
          }
      }
      const red_sentence = make_sentence_red(sentence, str_to_put_in, indexes);
      this.visual_representation.remove();
      this.sentence_information.text_at_correct_time = sentence;
      const currentText = document.querySelector(".text")
      currentText.setHTML(red_sentence)
      check_clear_message()
      set_margin()
    });
    return closeButton
  }

  create_wrong_word() {
    const wrongWord = document.createElement("div");
    wrongWord.classList.add("wrongWord")
    wrongWord.textContent = error[0];
    return wrongWord
  }

  create_arrow() {
    const arrow = document.createElement("div");
    arrow.classList.add("arrow")
    arrow.innerHTML = "&#8594;"
    return arrow
  }

  create_right_word() {
    const correctWord = document.createElement("div");
    correctWord.classList.add("correctWord")
    correctWord.textContent = error[1];
    return correctWord
  }

  create_description() {
    const description = document.createElement("div");
    description.classList.add("description");
    description.textContent = error[3]
    return description
  }
}