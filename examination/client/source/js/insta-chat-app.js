let chatWindowTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector("#chatWindowTemplate");

class InstaChatApp extends HTMLElement {
    constructor() {
        super();

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = chatWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {
        if (!localStorage.chatName) {
            //be om namn
        } else {
            //display input, hide chat. bara adda en hide - class
            //chat.setcofig (name = newname)
        }

        //event.listener - meny -> name
        //display input, hide chat. bara adda en hide - class
        //chat.setcofig (name = newname)
        //event listener meny - about
        //display about, hide chat. bara adda en hide - class
        //sen gör samma på memory med about och highscore
    }

    disconnectedCallback() {
        //close
        //sen gör samma på memory app
    }

    close() {
        //draggable window close
        //websocket close
    }
}

customElements.define('insta-chat-app', InstaChatApp);
