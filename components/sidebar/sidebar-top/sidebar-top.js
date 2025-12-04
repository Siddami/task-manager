class SidebarTop extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    fetch("/components/sidebar/sidebar-top/sidebar-top.html")
      .then((res) => res.text())
      .then((html) => {
        shadow.innerHTML = html;

        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute(
          "href",
          "/components/sidebar/sidebar-top/sidebar-top.css"
        );
        shadow.prepend(link);

        shadow.querySelector(".toggle-btn").addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("sidebar-toggle", { bubbles: true })
          );
        });
      })
      .catch((error) => {
        console.error("Failed to fetch sidebar-top HTML:", error);
      });
  }
}

customElements.define("sidebar-top", SidebarTop);
