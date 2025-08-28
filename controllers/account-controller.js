import { userStore } from "../models/user-store.js";

export const accountController = {
  showSignup(req, res) {
    res.render("signup-view", { title: "Signup" });
  },

  async signup(req, res) {
    const { firstName, lastName, email, password } = req.body;
    const exists = await userStore.findByEmail(email);
    if (exists) {
      return res.status(400).render("signup-view", { title: "Signup", error: "Email already registered." });
    }
    const user = await userStore.create({ firstName, lastName, email, password });
    req.session.user = user;
    res.redirect("/dashboard");
    return;
  },

  showLogin(req, res) {
    res.render("login-view", { title: "Login" });
  },

  async login(req, res) {
    const { email, password } = req.body;
    const user = await userStore.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).render("login-view", { title: "Login", error: "Invalid credentials." });
    }
    req.session.user = user;
    res.redirect("/dashboard");
    return;
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  },

  async settings(req, res) {
    const user = req.session.user;
    res.render("account-view", { title: "Your Account", user });
  },

  async update(req, res) {
    const user = req.session.user;
    const updated = await userStore.update(user._id, req.body);
    req.session.user = updated;
    res.redirect("/account");
  },
};
