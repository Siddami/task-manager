const getTemplate = (() => {
  let templatePromise = null;
  return () => {
    if (!templatePromise) {
      templatePromise = fetch("/components/task-modal/task-modal.html")
        .then((response) => response.text())
        .then((text) => {
          const template = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#task-modal-template");
          return template;
        });
    }
    return templatePromise;
  };
})();

class TaskModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const template = await getTemplate();
    const style = document.createElement("style");
    const cssResponse = await fetch("/components/task-modal/task-modal.css");
    style.textContent = await cssResponse.text();

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const modalOverlay = this.shadowRoot.querySelector(".modal-overlay");
    const cancelButton = this.shadowRoot.querySelector(".btn-cancel");
    const form = this.shadowRoot.querySelector("#task-form");

    cancelButton.addEventListener("click", () => this.hide());
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        this.hide();
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const taskData = Object.fromEntries(formData.entries());
      this.dispatchEvent(
        new CustomEvent("task-added", { detail: taskData, bubbles: true })
      );
      e.target.reset();
      this.hide();
    });
  }

  show() {
    this.shadowRoot.querySelector(".modal-overlay").classList.add("visible");
  }

  hide() {
    this.shadowRoot.querySelector(".modal-overlay").classList.remove("visible");
  }
}

customElements.define("task-modal", TaskModal);
