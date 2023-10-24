import { set_margin } from "../utils/page_control.js";
import { check_clear_message } from "./visualisation_other.js"
import { auto_check_text, display_errors } from "../handle_errors.js"
import { findEmojiIndexes } from "./correct_text.js"
import { get_text } from "./retrieve_text.js";
import { correct_sentence } from "./correct_text.js";
import { create_id_from_raw_error, unnestErrors } from "./helper_functions.js"

export function init_make_sentence_red(sentence, errors) {
  // Adds underline to each chunk, then smash them together

  let blue_chunks = []
  let chunks = get_text().split("<br>")

  for (let chunk_index = 0; chunk_index < chunks.length; chunk_index++) {
    let relevant_errors = errors.filter(error => error[4] === chunk_index);
    const chunk = chunks[chunk_index]

    let str_to_put_in = []
    let indexes = []

    for (let i = 0; i < relevant_errors.length; i++) {
      str_to_put_in.push(`<span class="highlightedWord">${chunk.slice(relevant_errors[i][2][0], relevant_errors[i][2][1])}</span>`);
      indexes.push([relevant_errors[i][2][0], relevant_errors[i][2][1]])
    }
    blue_chunks.push(make_sentence_red(chunk, str_to_put_in, indexes))
  }
  return blue_chunks.join("<br>")
}

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

function create_id(VisualErrorInstance) {
  return VisualErrorInstance.indexes[0] + VisualErrorInstance.wrong_word + VisualErrorInstance.indexes[1]
}

export function should_visualize_id(VisualErrorInstance) {
  if (VisualErrorInstance.sentence_information.removed_error_ids.includes(VisualErrorInstance.id)) {return false}
  return true
}

// Sentence information is an object as it allows for change without reinitilizing
// Has to include text_at_correction_time, current_text, corrected_errors

export class VisualError {
  constructor(error, sentence_information, error_index) {
    this.wrong_word = error[0]
    this.right_word = error[1]
    this.indexes = error[2]
    this.description = error[3]
    this.chunk_number = error[4]
    this.sentence_information = sentence_information
    this.error_index = error_index
    this.id = create_id(this)
    this.visual_representation = document.createElement("div")
    this.visual_representation.classList.add("error-message")
    this.init_visual_representation()
  }

  init_visual_representation() {
    this.visual_representation.append(this.create_close_button())
    this.visual_representation.append(this.create_wrong_word())
    this.visual_representation.append(this.create_arrow())
    this.visual_representation.append(this.create_right_word())
    this.visual_representation.append(this.create_description())
  }

  create_close_button() {
    const closeButton = document.createElement("div");
    closeButton.classList.add("close-button");
    closeButton.textContent = "X";
    closeButton.addEventListener("click", async () => {
      this.sentence_information.current_text = get_text()
      if (!(this.sentence_information.text_at_correction_time === this.sentence_information.current_text)) {
        this.visual_representation.remove()
        return;
      }
      this.sentence_information.corrected_errors.push(this.error_index)
      let errors = await unnestErrors(this.sentence_information)
      const red_sentence = init_make_sentence_red(get_text(), errors);
      this.visual_representation.remove()
      this.sentence_information.removed_error_ids.push(this.id)
      this.sentence_information.text_at_correction_time = this.sentence_information.current_text;
      const textUnderline = document.getElementById("text-underline")
      textUnderline.setHTML(red_sentence)
      check_clear_message(this.sentence_information)
      set_margin()
    });
    return closeButton
  }

  create_wrong_word() {
    const wrongWord = document.createElement("div");
    wrongWord.classList.add("wrongWord")
    wrongWord.textContent = this.wrong_word
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
    correctWord.textContent = this.right_word;
    correctWord.addEventListener("click", async () => {
      const start_time = (new Date()).getTime() / 1000;
      console.log((new Date()).getTime() / 1000 - start_time)
      this.sentence_information.current_text = get_text()
      if (!(this.sentence_information.text_at_correction_time === this.sentence_information.current_text)) {
        this.visual_representation.remove()
        return;
      }
      let str_to_put_in = []
      let indexes = []
      let chunks = get_text().split("<br>")
      this.sentence_information.corrected_errors.push(this.id)
      let errors = await unnestErrors(this.sentence_information)
      const corrected_sentence = correct_sentence(this.sentence_information.current_text, this.right_word, this.indexes[0], this.indexes[1], errors, this.chunk_number);
      this.sentence_information.current_text = corrected_sentence;
      this.visual_representation.remove();
      this.sentence_information.text_at_correction_time = this.sentence_information.current_text;
      console.log((new Date()).getTime() / 1000 - start_time)
      const text = document.getElementById("text")
      this.sentence_information.previous_chunks = corrected_sentence.split("<br>")
      const chunk_before_correction = chunks[this.chunk_number]
      const chunk_after_correction = corrected_sentence.split("<br>")[this.chunk_number]
      // this.sentence_information.errors_matching_text[chunk_after_correction] = this.sentence_information.errors_matching_text[chunk_before_correction]
      delete this.sentence_information.errors_matching_text.chunk_before_correction
      console.log((new Date()).getTime() / 1000 - start_time)
    
      let chunk_errors = this.sentence_information.errors_matching_text[chunk_before_correction]
      let errors_other_than_this = []
      for (let i = 0; i < chunk_errors.length; i++) {
        const id = create_id_from_raw_error(chunk_errors[i])
        if (id !== this.id) {
          errors_other_than_this.push(chunk_errors[i])
        }
      }
      this.sentence_information.errors_matching_text[chunk_after_correction] = errors_other_than_this
      console.log((new Date()).getTime() / 1000 - start_time)
      
      text.setHTML(corrected_sentence)
      const textUnderline = document.getElementById("text-underline")
      errors = await unnestErrors(this.sentence_information)
      const red_sentence = init_make_sentence_red(get_text(), errors);
      textUnderline.setHTML(red_sentence)
      console.log((new Date()).getTime() / 1000 - start_time)

      check_clear_message(this.sentence_information)
      display_errors()
      set_margin()
      console.log((new Date()).getTime() / 1000 - start_time)
      });
    return correctWord
  }

  create_description() {
    const description = document.createElement("div");
    description.classList.add("description");
    description.textContent = this.description
    return description
  }
}