

function isNumericAndShort(str) { return /^\d+$/.test(str) && str.length < 10; }

const tester_code = "1234"

function code_valid(code) {
    const codes = ["14187", "240506", tester_code] // should be secret, if you found this, hi ;) // azure functions
    if (!isNumericAndShort(code)) { return false }
    if (codes.some(c => c === code)) { return true }
    return false
}

function check_code(with_display) {
    document.getElementById("school-data").innerHTML = ""
    const schoolDataInput = document.getElementById("school-data-input");
    const schoolDataButton = document.getElementById("school-data-button");

    const code = schoolDataInput.value;
    if (code_valid(code)) {
        schoolDataInput.style.backgroundColor = "lightGreen";
        if (with_display) { display_school() }
        schoolDataInput.value = "";
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

export function initalize_input_and_button(with_display = null) {
    const schoolDataInput = document.getElementById("school-data-input");
    const schoolDataButton = document.getElementById("school-data-button");

    schoolDataInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            check_code(with_display)
        }
    });

    schoolDataButton.addEventListener("click", () => {
        check_code(with_display)
    })
}


export function display_school() {
    if (!code_valid(document.getElementById("school-data-input").value)) { return }

    const data_from_school = { // this should be returned from RESTapi
        "name": "_____ Gymnasium DA01",
        "scores": {
            "Nutids-r": 25,
            "Stavefejl": 90,
            "Komma": 20,
            "Manglende substantiv": 100,
        },
        "averages": {
            "Nutids-r": 20,
            "Stavefejl": 30,
            "Komma": 50,
            "Manglende substantiv": 80,
        },
        "usage": [12, 195]
    }
    display_school_data(data_from_school)
}

function display_school_data(data) {

    const school_data = document.getElementById("school-data")

    const school_data_information = document.createElement("div")
    school_data_information.classList.add("school-data-information")

    const header = document.createElement("h1");
    header.innerHTML = data["name"]
    school_data.appendChild(header)

    const col1 = document.createElement("div")
    col1.classList.add("column")
    const information_text = document.createElement("div")
    information_text.classList.add("information-text")
    information_text.innerHTML = `Den seneste måned har <span>${data["usage"][0]}</span> elever fra denne klasse brugt GrammatikTAK <span>${data["usage"][1]}</span> gange.`
    col1.appendChild(information_text)
    school_data_information.appendChild(col1)

    const blue_divider = document.createElement("div")
    blue_divider.classList.add("blue-divider")
    school_data_information.appendChild(blue_divider)
    
    const col2 = document.createElement("div")
    col2.classList.add("column")
    const keys = Object.keys(data["scores"]);

    for (let i = 0; i < keys.length; i++) {
        const slider_text = document.createElement("div");
        slider_text.classList.add("slider-text")
        slider_text.innerHTML = keys[i]

        const diff = data["scores"][keys[i]] - data["averages"][keys[i]]

        const slider_container = document.createElement("div");
        slider_container.classList.add("slider-container")

        const slider = document.createElement("div");
        slider.classList.add("slider")

        const filler = document.createElement("div");
        filler.classList.add("filler")
        filler.style.width = data["scores"][keys[i]] + "%";
        if (diff > 20 || data["scores"][keys[i]] > 90) { filler.style.backgroundColor = "rgba(144, 238, 144)" }
        else if (diff > -20) {filler.style.backgroundColor = "rgba(255, 255, 102)" }
        else { filler.style.backgroundColor = "rgba(255, 99, 71)"}

        const average_line = document.createElement("div");
        average_line.classList.add("vertical-line")
        average_line.style.left = data["averages"][keys[i]] + "%";

        slider.appendChild(filler)
        slider.appendChild(average_line)
        slider_container.appendChild(slider)
        col2.appendChild(slider_text)
        col2.appendChild(slider_container)
    }

    const averageLineText = document.createElement("div");
    averageLineText.classList.add("slider-text")
    averageLineText.innerHTML = '<span style="color: red; font-size: 20px; font-weight: bold;">l</span> = gennemsnit af alle skoler';
    col2.appendChild(averageLineText);

    school_data_information.appendChild(col2)
    school_data.appendChild(school_data_information)
}