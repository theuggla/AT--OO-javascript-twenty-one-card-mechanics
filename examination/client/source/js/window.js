function Window(type) {
    let name;
    let symbol;

    class Window {
        constructor(type) {
            name = type;
        }

        get name() {
            return name;
        }

        set name(name) {

        }

        get menu() {
            return menu.clone();
        }

        set menu(newMenu) {

        }

        addMenuItem(item) {

        }

        removeMenuItem(item) {

        }
    }

    return new Window(type)
}


module.exports = Window;
