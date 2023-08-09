
class VisualError {
    constructor(error, sentence) {
        this.wrong_word = error[0]
        this.right_word = error[1]
        this.indexes = error[2]
        this.description = error[3]
        this.sentence = sentence
        this.visual_representation = document.createElement("div")
        this.visual_representation.classList.add("error-message")
    }

    update_sentence(sentence) {
        this.sentence = sentence
    }
    init_visual_representation() {
        this.visual_representation.append(this.close_button())
    }

    close_button() {
        const closeButton = document.createElement("div");
        closeButton.classList.add("close-button");
        closeButton.textContent = "X";
    }

}