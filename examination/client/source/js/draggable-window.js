let windowTemplate = document.querySelector('link[href="/draggable-window.html"]').import.querySelector("#windowTemplate");

class DraggableWindow extends HTMLElement {
    constructor(type) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open", delegatesFocus: true});
        let instance = windowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {

        //set behaviour
        makeDraggable(this, this.parentNode);

        //add event listeners
        this.addEventListener("click", (event) => {
            let target = event.composedPath()[0];
            let id = target.getAttribute("id");
            if (id === "close") {
                debugger;
                this.close();
            } else if (id === "minimize") {
                this.minimized = true;
            }
            if (event.type === 'click') {
                event.preventDefault();
            }
        });

        this.open = true;
    }

    get open() {
        return this.hasAttribute('open');
    }

    set open(open) {
        if (open) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }
    }

    get minimized() {
        return this.hasAttribute('minimized');
    }

    set minimized(minimize) {
        if (minimize) {
            this.setAttribute('minimized', '');
        } else {
            this.removeAttribute('minimized');
        }
    }

    close() {
        this.open = false;
        this.minimized = false;
        this.parentNode.removeChild(this);
    }

}

function makeDraggable(el, container) {
    let arrowDrag;
    let mouseDrag;
    let dragoffset = {
        x: 0,
        y: 0
    };

    let events = function() {
        addEventListeners(el, 'focusin mousedown touchmove', (function(event) {
            let target;
            if (event.type === 'touchmove') {
                target = event.targetTouches[0];
            } else {
                target = event;
            }
            arrowDrag = true;
            if (event.type === 'mousedown' || event.type === 'touchmove') {
                mouseDrag = true;
                dragoffset.x = target.pageX - el.offsetLeft;
                dragoffset.y = target.pageY - el.offsetTop;
            }
        }));
        addEventListeners(el, 'focusout mouseup', (function() {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown touchmove', ((event) => {
            let destination = {};

            if (mouseDrag) {
                destination.y = (event.pageY - dragoffset.y);
                destination.x = (event.pageX - dragoffset.x);
            } else if (arrowDrag) {
                destination.y = parseInt(el.style.top.slice(0, -2));
                destination.x = parseInt(el.style.left.slice(0, -2));

                switch (event.key) {
                    case 'ArrowUp':
                        destination.y -= 5;
                        break;
                    case 'ArrowDown':
                        destination.y += 5;
                        break;
                    case 'ArrowLeft':
                        destination.x -= 5;
                        break;
                    case 'ArrowRight':
                        destination.x += 5;
                        break;
                }
            }

            if (mouseDrag || arrowDrag) {
                el.style.left = destination.x  + "px";
                el.style.top = destination.y  + "px";
            }

        }));
    };

    el.style.position = "absolute";
    events();
}

customElements.define('draggable-window', DraggableWindow);

    function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}
