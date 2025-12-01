const template = document.getElementById('auth-template')

// creating the element and calling the shadow DOM
class AuthPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const CLONE = template.content.cloneNode(true);
    this.shadowRoot.appendChild(CLONE);
  }

  connectedCallback(){
    this.render();
  }

  render(){
    const mode = this.getAttribute("mode");

    let fileToImport = mode === "login" ? "/components/login/login.html" : "/components/signup/signup.html";

    fetch(`${fileToImport}`)
    .then(response => response.text())
    .then(html => {
        this.shadowRoot.querySelector("slot").innerHTML = html;
    })
  }
}

customElements.define('auth-page', AuthPage);