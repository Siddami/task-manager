class TaskHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.loadTemplateAndRender();
  }

  static get observedAttributes() {
    return ["icon-src", "title-text", "subtitle-text"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  async loadTemplateAndRender() {
    try {
      const response = await fetch(
        "/components/task/task-header/task-header.html"
      );
      if (!response.ok)
        throw new Error("Failed to fetch task header template.");
      const text = await response.text();

      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "/components/task/task-header/task-header.css";

      this.shadowRoot.innerHTML = text;
      this.shadowRoot.prepend(style);

      this.render();
    } catch (error) {
      console.error("Error loading TaskHeader:", error);
      this.shadowRoot.innerHTML = `<p style="color: red">Error loading header</p>`;
    }
  }

  render() {
    if (!this.shadowRoot.querySelector(".task-wrapper")) {
      // Template not loaded yet
      return;
    }

    const iconSrc =
      this.getAttribute("icon-src") || "/assets/images/image_4.svg";
    const titleText = this.getAttribute("title-text") || "Task Management";
    const subtitleText =
      this.getAttribute("subtitle-text") || "Manage and track your tasks";

    this.shadowRoot.querySelector(".task-header-icon img").src = iconSrc;
    this.shadowRoot.querySelector(
      ".task-header-icon img"
    ).alt = `${titleText} icon`;
    this.shadowRoot.querySelector(".task-header-title").textContent = titleText;
    this.shadowRoot.querySelector(".task-header-subtitle").textContent =
      subtitleText;
  }
}

customElements.define("task-header", TaskHeader);
