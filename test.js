class AddOnToDict {
    constructor(dictionary) {
        this.dictionary = dictionary
    }
    add_one() {
        this.dictionary.first = this.dictionary.first + 1
    }
}

dictionary = {first: 1, second: 2}
my_class = new AddOnToDict(dictionary)
my_class.add_one()
console.log(dictionary)