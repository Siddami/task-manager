import { navigateTo } from "../../assets/js/global.js";
import { auth } from "../../assets/js/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "/components/sidebar/sidebar-top/sidebar-top.js";
import "/components/sidebar/sidebar-user/sidebar-user.js";
import "/components/sidebar/sidebar-nav-item/sidebar-nav-item.js";
import "/components/task/task-header/task-header.js";
import "/components/task-modal/task-modal.js";

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
    this.contentToProject = [...this.childNodes];
    this.innerHTML = "";
  }

  async connectedCallback() {
    try {
      const template = await getTemplate();
      const templateContent = template.content.cloneNode(true);

      this._projectContent(templateContent);
      this.appendChild(templateContent);

      this.contentArea = this.querySelector(".dashboard-content");

      this._attachEventListeners();
      this._loadLogoutIcon();

      // Load the initial page content if it's empty
      if (this.contentToProject.length === 0) {
        this._loadPageContent("/pages/dashboard/task.html");
      }
    } catch (error) {
      console.error("Error initializing DashboardPage:", error);
      this.innerHTML = `<p style="color: red; text-align: center;">Error loading dashboard. Please try again later.</p>`;
    }
  }

  _projectContent(templateContent) {
    const slot = templateContent.querySelector("slot");
    if (slot && this.contentToProject.length > 0) {
      slot.replaceWith(...this.contentToProject);
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

        // Update active state for all nav items
        this.querySelectorAll("sidebar-nav-item").forEach((item) => {
          item.removeAttribute("active");
        });
        navItem.setAttribute("active", "true");

        if (page) {
          this._loadPageContent(page);
        }
      });
    });

    this.contentArea?.addEventListener("click", this._handleContentClicks);
    this.addEventListener("task-added", this._handleTaskAdded);
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

  _handleTaskAdded = (event) => {
    const taskData = event.detail;
    if (!taskData.title) return;

    const taskList = this.contentArea.querySelector(".task-list");
    const activeTasksCounter =
      this.contentArea.querySelector(".active-tasks h2");
    if (!taskList) return;

    // If it's the first task, clear the "No task yet" message
    const noTaskMessage = taskList.querySelector(".list-info");
    if (noTaskMessage) {
      taskList.innerHTML = "";
      taskList.style.border = "none";
      taskList.style.padding = "0";
      taskList.style.backgroundColor = "transparent";
    }

    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    const formattedDate = taskData.dueDate
      ? new Date(taskData.dueDate).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })
      : "";

    taskItem.innerHTML = `
      <div class="task-item-left">
        <input type="checkbox" class="task-checkbox" />
        <div class="task-item-details">
          <p class="task-title">${taskData.title}</p>
          ${
            taskData.description
              ? `<p class="task-description">${taskData.description}</p>`
              : ""
          }
          ${
            formattedDate
              ? `<p class="task-due-date">Due: ${formattedDate}</p>`
              : ""
          }
        </div>
      </div>
      <div class="task-item-right">
        <span class="priority-badge priority-${taskData.priority || "low"}">${
      taskData.priority || "low"
    }</span>
        <button class="delete-task-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 lucide-trash-2 h-4 w-4" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;

    taskList.appendChild(taskItem);

    // Update the active tasks counter
    if (activeTasksCounter) {
      activeTasksCounter.textContent =
        parseInt(activeTasksCounter.textContent, 10) + 1;
    }

    this._saveTasksToLocalStorage();
  };

  _handleContentClicks = (event) => {
    const target = event.target;

    // Handle task deletion
    const deleteBtn = target.closest(".delete-task-btn");
    if (deleteBtn) {
      const taskItem = deleteBtn.closest(".task-item");
      if (taskItem) {
        const isCompleted = taskItem.classList.contains("completed");
        this._updateCounters(isCompleted ? 0 : -1, isCompleted ? -1 : 0);
        taskItem.remove();
        this._checkAndRestorePlaceholder();
        this._saveTasksToLocalStorage();
      }
      return;
    }

    // Handle task completion
    if (target.matches(".task-checkbox")) {
      const taskItem = target.closest(".task-item");
      if (taskItem) {
        const isNowCompleted = target.checked;
        taskItem.classList.toggle("completed", isNowCompleted);
        this._updateCounters(isNowCompleted ? -1 : 1, isNowCompleted ? 1 : -1);
        this._saveTasksToLocalStorage();
      }
      return;
    }

    // Handle "Add Task" button
    const addTaskBtn = event.target.closest(".task-button");
    if (addTaskBtn) {
      this.querySelector("task-modal")?.show();
      return;
    }

    // Handle toggle buttons
    const toggleBtn = event.target.closest(".toggle-btn");
    if (!toggleBtn) return;

    const isTasksToggle = toggleBtn.id === "tasks-toggle";
    const tasksToggle = this.contentArea.querySelector("#tasks-toggle");
    const summaryToggle = this.contentArea.querySelector("#summary-toggle");
    const myTasksContent = this.contentArea.querySelector("#my-tasks-content");
    const aiSummaryContent = this.contentArea.querySelector(
      "#ai-summary-content"
    );

    if (
      !tasksToggle ||
      !summaryToggle ||
      !myTasksContent ||
      !aiSummaryContent
    ) {
      return;
    }

    tasksToggle.classList.toggle("active", isTasksToggle);
    summaryToggle.classList.toggle("active", !isTasksToggle);
    myTasksContent.classList.toggle("active", isTasksToggle);
    aiSummaryContent.classList.toggle("active", !isTasksToggle);
  };

  _updateCounters(activeChange, completedChange) {
    const activeTasksCounter =
      this.contentArea.querySelector(".active-tasks h2");
    const completedTasksCounter = this.contentArea.querySelector(
      ".completed-tasks h2"
    );

    if (activeTasksCounter) {
      activeTasksCounter.textContent =
        parseInt(activeTasksCounter.textContent, 10) + activeChange;
    }
    if (completedTasksCounter) {
      completedTasksCounter.textContent =
        parseInt(completedTasksCounter.textContent, 10) + completedChange;
    }
  }

  async _loadPageContent(pagePath) {
    if (!this.contentArea) return;

    try {
      const response = await fetch(pagePath);
      if (!response.ok) throw new Error(`Failed to fetch page: ${pagePath}`);
      const pageText = await response.text();

      // Parse the fetched HTML to prevent re-injecting the whole page structure.
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageText, "text/html");

      const pageContent = doc.querySelector(
        ".task-page-content, .settings-page-content"
      );

      this.contentArea.innerHTML = pageContent
        ? pageContent.outerHTML
        : pageText;

      if (pagePath.includes("task.html")) {
        this._loadTasksFromStorage();
      }
    } catch (error) {
      console.error("Error loading page content:", error);
      this.contentArea.innerHTML = `<p style="color: red;">Error loading content.</p>`;
    }
  }

  _saveTasksToLocalStorage() {
    const taskItems = this.querySelectorAll(".task-item");
    const tasks = [];

    taskItems.forEach((item) => {
      const title = item.querySelector(".task-title")?.textContent;
      const description =
        item.querySelector(".task-description")?.textContent || "";
      const dueDate = item.dataset.dueDate || "";
      const priority =
        item.querySelector(".priority-badge")?.textContent || "low";
      const isCompleted = item.classList.contains("completed");

      if (title) {
        tasks.push({
          title,
          description,
          dueDate,
          priority,
          isCompleted,
        });
      }
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  _loadTasksFromStorage() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    if (tasks.length === 0) return;

    const taskList = this.contentArea.querySelector(".task-list");
    if (!taskList) return;

    // Clear placeholder
    taskList.innerHTML = "";
    taskList.style.border = "none";
    taskList.style.padding = "0";
    taskList.style.backgroundColor = "transparent";

    let activeCount = 0;
    let completedCount = 0;

    tasks.forEach((taskData) => {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";
      if (taskData.dueDate) taskItem.dataset.dueDate = taskData.dueDate;
      if (taskData.isCompleted) {
        taskItem.classList.add("completed");
        completedCount++;
      } else {
        activeCount++;
      }

      const formattedDate = taskData.dueDate
        ? new Date(taskData.dueDate).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })
        : "";
      taskItem.innerHTML = `
        <div class="task-item-left">
          <input type="checkbox" class="task-checkbox" ${
            taskData.isCompleted ? "checked" : ""
          }/>
          <div class="task-item-details">
            <p class="task-title">${taskData.title}</p>
            ${
              taskData.description
                ? `<p class="task-description">${taskData.description}</p>`
                : ""
            }
            ${
              taskData.dueDate
                ? `<p class="task-due-date">Due: ${formattedDate}</p>`
                : ""
            }
          </div>
        </div>
        <div class="task-item-right">
          <span class="priority-badge priority-${taskData.priority}">${
        taskData.priority
      }</span>
          <button class="delete-task-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 lucide-trash-2 h-4 w-4" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
      taskList.appendChild(taskItem);
    });

    // Update counters
    this.contentArea.querySelector(".active-tasks h2").textContent =
      activeCount;
    this.contentArea.querySelector(".completed-tasks h2").textContent =
      completedCount;
  }

  _checkAndRestorePlaceholder() {
    const taskList = this.contentArea.querySelector(".task-list");
    if (taskList && taskList.children.length === 0) {
      taskList.style.border = "1px dashed var(--primary-color)";
      taskList.style.backgroundColor = "var(--lighter-ring)";
      taskList.style.padding = "1em";
      taskList.innerHTML = `
        <div class="list-info">
          <div class="task-ring"></div>
          <p>No task yet</p>
          <p>Click "Add Task" to create your first task</p>
        </div>
      `;
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
