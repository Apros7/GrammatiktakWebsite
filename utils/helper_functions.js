export function create_id_from_raw_error(error) {
  return error[2][0] + error[0] + error[2][1]
}

function should_visualize_id(id, sentence_information) {
  if (sentence_information.removed_error_ids.includes(id)) {return false}
  return true
}

export async function unnestErrors(sentence_information) {
  let errors = sentence_information.errors_from_backend
  let unnested_errors = []
  for (let i = 0; i < errors.length; i++) {
    if (typeof errors[i] === 'undefined') { continue }
    for (let j = 0; j < errors[i].length; j++) {
      const id = create_id_from_raw_error(errors[i][j])
      if (should_visualize_id(id, sentence_information)) {
        unnested_errors.push(errors[i][j].concat([i]))
      }
    }
  }
  return unnested_errors
}