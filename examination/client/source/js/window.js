

let t = document.querySelector("template") || document.currentScript.ownerDocument.querySelector("template");

customElements.define('draggable-window', class extends HTMLElement {
    constructor(type) {
        super();
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = t.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {
        u.makeDraggable(this, this.parentNode);
    }

});
