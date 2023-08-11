
export function correct_sentence(sentence, string_to_put_in, start_index, end_index, errors) {
  if (start_index === end_index) {
    // no characters need to be added, return the original sentence and errors
    return [sentence, errors];
  }
  const emojiIndexes = findEmojiIndexes(sentence);
  for (const j in emojiIndexes) {
    const value = emojiIndexes[j]
    if (value < start_index) {
      start_index += 1; end_index += 1;
    }
    else if (value < end_index) {
      end_index += 1
    }
  }
  const corrected_sentence = sentence.slice(0, start_index) + string_to_put_in + sentence.slice(end_index)
  if (end_index !== start_index + string_to_put_in.length) {
    const difference = start_index + string_to_put_in.length - end_index
    for (let i = 0; i < errors.length; i++) {
      if (errors[i][2][0] > start_index) {
        errors[i][2][0] = errors[i][2][0] + difference
        errors[i][2][1] = errors[i][2][1] + difference
      }
    }
    }
  return [corrected_sentence, errors]
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