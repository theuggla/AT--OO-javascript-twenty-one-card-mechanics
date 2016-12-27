let menuTemplate = document.querySelector('link[href="/expandable-menu-item.html"]').import.querySelector("#menuItemTemplate");

customElements.define('expandable-menu-item', class extends HTMLElement {
    constructor() {
        super();

        //set up shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = menuTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

    }

    connectedCallback() {
        makeExpandable(this);
    }

    get subMenu() {
        let label = this.getAttribute('label');
        return Array.prototype.filter.call(this.querySelectorAll('[slot="subitem"]'), (node) => {
            let nodeLabel = node.getAttribute('label');
            return nodeLabel === label;
        });
    }

    get displayingSubMenu() {
        return !this.subMenu[0].hasAttribute('hide');
    }

    toggleSubMenu(show) {
        if (show) {
            this.subMenu.forEach((post) => {
                post.removeAttribute('hide');
            });
        } else {
            this.subMenu.forEach((post) => {
                post.setAttribute('hide', '');
            });
        }

    }

});


function makeExpandable(item) {
    let nextFocus = 0;
    let show = false;
    let arrowExpand;
    let mouseExpand;

    let events = function () {
        addEventListeners(item, 'focusin click', ((event) => {
            console.log(document.activeElement);
            item.firstElementChild.focus();
            console.log(document.activeElement);
                arrowExpand = true;

                if (event.type === 'click') {
                    mouseExpand = true;
                    show = !show;
                    event.preventDefault();
                }

                item.toggleSubMenu(show);
        }));
        addEventListeners(item, 'keydown', ((event) => {
            item.focus();
                if (arrowExpand) {
                    switch (event.key) {
                        case 'ArrowRight':
                            item.toggleSubMenu(true);
                            break;
                        case 'ArrowLeft':
                            item.toggleSubMenu(false);
                            break;
                        case 'ArrowUp':
                            if (!item.displayingSubMenu) {
                                item.toggleSubMenu(true);
                            }
                            nextFocus -= 1;
                            if (nextFocus < 0) {
                                nextFocus = 3;
                            }
                            item.subMenu[nextFocus].focus();
                            break;
                        case 'ArrowDown':
                            if (!item.displayingSubMenu) {
                                item.toggleSubMenu(true);
                            }
                            nextFocus += 1;
                            if (nextFocus > 3) {
                                nextFocus = 0;
                            }
                            item.subMenu[nextFocus].focus();
                            console.log(document.activeElement.shadowRoot.activeElement);
                            break;
                    }
                }

        }));
    };

    events();
}

function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}
