import { navigateTo } from "../../assets/js/global.js";
import { auth } from "../../assets/js/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "/components/sidebar/sidebar-top/sidebar-top.js";
import "/components/sidebar/sidebar-user/sidebar-user.js";
import "/components/sidebar/sidebar-nav-item/sidebar-nav-item.js";
import "/components/task/task-header/task-header.js";

/**
 * Fetches and caches the dashboard HTML template to prevent redundant network requests.
 * @returns {Promise<HTMLTemplateElement>} A promise that resolves to the template element.
 */
const getTemplate = (() => {
  let templatePromise = null;
  return () => {
    if (!templatePromise) {
      templatePromise = fetch("/templates/dashboard/dashboard.html")
        .then((response) => {
          if (!response.ok)
            throw new Error("Failed to fetch dashboard template");
          return response.text();
        })
        .then((text) => {
          const template = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#dashboard-template");
          if (!template) throw new Error("#dashboard-template not found");
          return template;
        });
    }
    return templatePromise;
  };
})();

class DashboardPage extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      // 1. Save the content to project now that it's guaranteed to be available.
      const contentToProject = [...this.childNodes];
      this.innerHTML = ""; // 2. Clear the component.

      const template = await getTemplate();
      const templateContent = template.content.cloneNode(true);

      this._projectContent(templateContent, contentToProject); // 3. Project content
      this.appendChild(templateContent); // 4. Append the final result

      this.contentArea = this.querySelector(".dashboard-content");

      this._attachEventListeners();
      this._loadLogoutIcon();

      // Load the initial page content if it's empty
      if (contentToProject.length === 0) {
        this._loadPageContent("/pages/dashboard/task.html");
      }
    } catch (error) {
      console.error("Error initializing DashboardPage:", error);
      this.innerHTML = `<p style="color: red; text-align: center;">Error loading dashboard. Please try again later.</p>`;
    }
  }

  /**
   * Finds the <slot> in the template and replaces it with the original child nodes.
   * @param {DocumentFragment} templateContent - The cloned template content.
   */
  _projectContent(templateContent, contentToProject) {
    const slot = templateContent.querySelector("slot");
    if (slot && contentToProject.length > 0) {
      slot.replaceWith(...contentToProject);
    }
  }

  _attachEventListeners() {
    // Logout Button
    this.querySelector(".logout")?.addEventListener(
      "click",
      this._handleLogout
    );

    // Navigation Links
    this.querySelectorAll("sidebar-nav-item").forEach((navItem) => {
      navItem.addEventListener("click", () => {
        const page = navItem.getAttribute("page");
        if (page) {
          this._loadPageContent(page);
        }
      });
    });
  }

  _handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigateTo("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  async _loadPageContent(pagePath) {
    if (!this.contentArea) return;

    try {
      const response = await fetch(pagePath);
      if (!response.ok) throw new Error(`Failed to fetch page: ${pagePath}`);
      this.contentArea.innerHTML = await response.text();
    } catch (error) {
      console.error("Error loading page content:", error);
      this.contentArea.innerHTML = `<p style="color: red;">Error loading content.</p>`;
    }
  }

  async _loadLogoutIcon() {
    try {
      const response = await fetch("/assets/images/logout.svg");
      if (!response.ok) throw new Error("Failed to fetch logout icon.");
      const svgText = await response.text();
      const iconContainer = this.querySelector(".logout-icon");
      if (iconContainer) {
        iconContainer.innerHTML = svgText;
      }
    } catch (error) {
      console.error("Error loading logout icon:", error);
    }
  }
}

customElements.define("dashboard-page", DashboardPage);
