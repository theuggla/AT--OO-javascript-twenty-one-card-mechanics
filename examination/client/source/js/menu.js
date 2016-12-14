function Menu(item) {
    let items = [];

    class Menu {
        constructor(item) {
            items.push(item);
        }

        get items() {
            return items.slice();
        }

        set items(item) {
            items.push(item);
        }
    }

    return new Menu(item);
}


module.exports = Menu;
