class SidebarNavItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    await this.loadTemplate();
    await this.render();
    this.updateActiveState();
  }

  static get observedAttributes() {
    return ["active"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "active") {
      this.updateActiveState();
    }
  }

  async loadTemplate() {
    try {
      const response = await fetch(
        "/components/sidebar/sidebar-nav-item/sidebar-nav-item.html"
      );
      if (!response.ok) throw new Error("Failed to fetch nav item template.");
      const text = await response.text();

      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "/components/sidebar/sidebar-nav-item/sidebar-nav-item.css";

      this.shadowRoot.innerHTML = text;
      this.shadowRoot.prepend(style);
    } catch (error) {
      console.error("Error loading SidebarNavItem:", error);
      this.shadowRoot.innerHTML = `<p style="color: red">Error</p>`;
    }
  }

  async render() {
    const page = this.getAttribute("page");
    const icon = this.getAttribute("icon");
    const text = this.getAttribute("text");
    const currentPath = window.location.pathname;

    const button = this.shadowRoot.querySelector(".nav-btn");
    if (button) {
      button.setAttribute("data-page", page);
      this.shadowRoot.querySelector(".nav-text").textContent = text;
      if (icon) {
        await this.loadIcon(icon);
      }
    }
  }

  async loadIcon(iconPath) {
    try {
      const response = await fetch(iconPath);
      if (!response.ok) throw new Error("Failed to fetch SVG icon.");
      const svgText = await response.text();
      const iconContainer = this.shadowRoot.querySelector(".nav-icon");
      if (iconContainer) {
        iconContainer.innerHTML = svgText;
      }
    } catch (error) {
      console.error(`Error loading icon: ${iconPath}`, error);
    }
  }

  updateActiveState() {
    const button = this.shadowRoot.querySelector(".nav-btn");
    if (!button) return;

    const isActive = this.hasAttribute("active");
    button.classList.toggle("active", isActive);
  }
}

customElements.define("sidebar-nav-item", SidebarNavItem);
