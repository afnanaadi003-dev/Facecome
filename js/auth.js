/**
 * Facecome demo auth — stored in localStorage.
 * NOT for production: passwords are plain text and client-side only.
 */
(function () {
  var USERS_KEY = 'facecome_users';
  var SESSION_KEY = 'facecome_session';

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  window.FacecomeAuth = {
    signup: function (name, email, password) {
      var users = readUsers();
      if (users.some(function (u) { return u.email === email; })) {
        return { ok: false, message: 'An account with this email already exists.' };
      }
      users.push({ name: name, email: email, password: password });
      writeUsers(users);
      localStorage.setItem(SESSION_KEY, email);
      return { ok: true };
    },

    login: function (email, password) {
      var users = readUsers();
      var user = users.find(function (u) {
        return u.email === email && u.password === password;
      });
      if (!user) {
        return { ok: false, message: 'Incorrect email or password.' };
      }
      localStorage.setItem(SESSION_KEY, email);
      return { ok: true };
    },

    logout: function () {
      localStorage.removeItem(SESSION_KEY);
    },

    /**
     * Reset an account's password. If the email is not registered,
     * the same generic message is returned so accounts can't be probed.
     */
    resetPassword: function (email, newPassword) {
      var users = readUsers();
      var user = users.find(function (u) { return u.email === email; });
      if (!user) {
        return { ok: true, message: "If that email is registered, the password has been reset." };
      }
      user.password = newPassword;
      writeUsers(users);
      return { ok: true, message: "Password reset successfully. You can now log in with your new password." };
    },

    getSession: function () {
      return localStorage.getItem(SESSION_KEY);
    },

    findUser: function (email) {
      return readUsers().find(function (u) { return u.email === email; }) || null;
    },

    showError: function (el, message) {
      el.textContent = message;
      el.classList.remove('hidden');
    }
  };
})();
