
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

export function correct_sentence(sentence, string_to_put_in, start_index, end_index, errors, corrected_chunk_number) {

  if (start_index === end_index) {
    // no characters need to be added, return the original sentence and errors
    return [sentence, errors];
  }

  let chunks = sentence.split("<br>")
  const chunk = chunks[corrected_chunk_number]

  const emojiIndexes = findEmojiIndexes(chunk);
  for (const j in emojiIndexes) {
    const value = emojiIndexes[j]
    if (value < start_index) {
      start_index += 1; end_index += 1;
    }
    else if (value < end_index) {
      end_index += 1
    }
  }
  const corrected_chunk = chunk.slice(0, start_index) + string_to_put_in + chunk.slice(end_index)
  chunks[corrected_chunk_number] = corrected_chunk
  if (end_index !== start_index + string_to_put_in.length) {
    for (let i = 0; i < errors.length; i++) {
      let difference = 0
      if (corrected_chunk_number === errors[i][4]) { difference += start_index + string_to_put_in.length - end_index }
      if (errors[i][2][0] > start_index) {
        errors[i][2][0] = errors[i][2][0] + difference
        errors[i][2][1] = errors[i][2][1] + difference
      }
    }
    }
  return chunks.join("<br>")
}

export function findEmojiIndexes(str) {
  const emojiRegex = /\p{Emoji}/gu; // Unicode property escapes for emoji matching

  const emojiIndexes = [];
  let match;
  while ((match = emojiRegex.exec(str)) !== null) {
    emojiIndexes.push(match.index);
  }

  return emojiIndexes;
}