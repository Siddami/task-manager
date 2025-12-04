import { login, navigateTo, signUp } from "./global.js";

const template = document.getElementById("auth-template");

class AuthPage extends HTMLElement {
  constructor() {
    super();
    const CLONE = template.content.cloneNode(true);
    this.appendChild(CLONE);
    this._wrapper = this.querySelector(".auth-wrapper");
    this._loginBtn = this.querySelector(".toggle-btn.login-btn");
    this._signupBtn = this.querySelector(".toggle-btn.signup-btn");
    this._title = this.querySelector(".auth-text h1");
    this._subtitle = this.querySelector(".auth-text p");

    this._onToggleClick = (e) => {
      const isLogin = e.currentTarget.classList.contains("login-btn");
      const newMode = isLogin ? "login" : "signup";
      this.setAttribute("mode", newMode);
      this.render();
      this._updateToggleState();
    };
    if (this._loginBtn)
      this._loginBtn.addEventListener("click", this._onToggleClick);
    if (this._signupBtn)
      this._signupBtn.addEventListener("click", this._onToggleClick);
  }

  connectedCallback() {
    this.render();
    this._updateToggleState();
  }

  _updateToggleState() {
    const mode = this.getAttribute("mode") || "login";
    if (this._wrapper) {
      this._wrapper.classList.remove("mode-login", "mode-signup");
      this._wrapper.classList.add(
        mode === "signup" ? "mode-signup" : "mode-login"
      );
    }
    if (this._loginBtn)
      this._loginBtn.classList.toggle("active", mode === "login");
    if (this._signupBtn)
      this._signupBtn.classList.toggle("active", mode === "signup");

    // update header text to match the active mode
    if (this._title) {
      this._title.textContent =
        mode === "signup" ? "Join TaskMaster" : "Welcome Back!";
    }
    if (this._subtitle) {
      this._subtitle.textContent =
        mode === "signup"
          ? "Create an account to boost your productivity"
          : "Enter your details to access your account";
    }
  }

  render() {
    const mode = this.getAttribute("mode");

    let fileToImport =
      mode === "login"
        ? "../../pages/login/login.html"
        : "../../pages/signup/signup.html";

    fetch(`${fileToImport}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((html) => {
        this.querySelector("slot").innerHTML = html;

        this._attachFormListeners();
      })
      .catch((error) => {
        console.error("Error fetching HTML:", error);
      });
  }

  _attachFormListeners() {
    const mode = this.getAttribute("mode");
    const form = this.querySelector("form");

    if (!form) return;

    const helpBtn = form.querySelector(".help-btn");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        alert("Help is on its way!");
      });
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      if (mode === "login") {
        await this._handleLogin(email, password);
      } else {
        const fullName = form.fullName.value;
        await this._handleSignUp(fullName, email, password);
      }
    });
  }

  async _handleSignUp(fullName, email, password) {
    try {
      await signUp(fullName, email, password);
      navigateTo("/pages/dashboard/task.html");
    } catch (error) {
      console.error("Error during sign up:", error);
      alert(`Sign Up Failed: ${error ? error.message : "Unknown error"}`);
    }
  }

  async _handleLogin(email, password) {
    try {
      await login(email, password);
      navigateTo("/pages/dashboard/task.html");
    } catch (error) {
      console.error("Error during login:", error);
      alert(`Login Failed: ${error ? error.message : "Unknown error"}`);
    }
  }
}

customElements.define("auth-page", AuthPage);
