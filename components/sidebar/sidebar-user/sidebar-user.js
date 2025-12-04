import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
} from "/assets/js/firebase.js";
import "/assets/js/auth.js";

class SidebarUser extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this._unsubscribeAuth = null;
  }

  async connectedCallback() {
    await this.fetchHtml();
     await new Promise((resolve) => requestAnimationFrame(resolve));
    this.setupAuthListener();
  }

  disconnectedCallback() {
    if (this._unsubscribeAuth) {
      this._unsubscribeAuth();
    }
  }

  async fetchHtml() {
    try {
      const response = await fetch(
        "/components/sidebar/sidebar-user/sidebar-user.html"
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch HTML: ${response.statusText}`);
      }

      const text = await response.text();

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/components/sidebar/sidebar-user/sidebar-user.css";

      this.shadow.innerHTML = text;
      this.shadow.prepend(link);

      await new Promise((resolve) => requestAnimationFrame(resolve));
    } catch (error) {
      console.error("Error loading sidebar user component:", error);
      this.shadow.innerHTML = `<p style="color: red;">Error loading user component</p>`;
    }
  }

  setupAuthListener() {
    this._unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.loadUserData(user);
      } else {
        this.displayDefaultState();
      }
    });
  }

  async loadUserData(user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.error("User document not found");
        this.displayDefaultState(user.email);
        return;
      }

      const userData = userDoc.data();

      const fullName = userData?.fullName || "User";

      const usernameEl = this.shadow.querySelector(".username");
      const emailEl = this.shadow.querySelector(".user-email");
      const avatarEl = this.shadow.querySelector(".avatar");

      if (usernameEl) usernameEl.textContent = fullName;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = fullName.charAt(0).toUpperCase();
    } catch (error) {
      console.error("Error fetching user data:", error);
      this.displayDefaultState(user.email);
    }
  }

  displayDefaultState(email = "") {
    const usernameEl = this.shadow.querySelector(".username");
    const emailEl = this.shadow.querySelector(".user-email");
    const avatarEl = this.shadow.querySelector(".avatar");

    if (usernameEl) usernameEl.textContent = "User";
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = "U";
  }
}

customElements.define("sidebar-user", SidebarUser);
