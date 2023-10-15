
function code_valid(code) {
    const codes = ["14187", "240506"] // should be secret, if you found this, hi ;)
    if (codes.some(c => c === code)) { return true }
    return false
}

function check_code() {
    const schoolDataInput = document.getElementById("school-data-input");
    const schoolDataButton = document.getElementById("school-data-button");

    const code = schoolDataInput.value;
    if (code_valid(code)) {
        schoolDataInput.style.backgroundColor = "lightGreen";
    } else {
        schoolDataButton.innerHTML = "&#10007;";
        schoolDataInput.style.backgroundColor = "lightCoral";
        setTimeout(() => {
            schoolDataInput.value = "";
            schoolDataInput.style.backgroundColor = "white";
            schoolDataButton.innerHTML = "&#10003;";
        }, 1000)
    }
}

export function initalize_input_and_button() {
    const schoolDataInput = document.getElementById("school-data-input");
    const schoolDataButton = document.getElementById("school-data-button");

    schoolDataInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            check_code()
        }
    });

    schoolDataButton.addEventListener("click", () => {
        check_code()
    })
}