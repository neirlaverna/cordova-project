// profile.view.js - Profile View

const ProfileView = {
  render: function (container) {
    const auth = App.controllers.auth;
    const userData = auth.userData;

    container.innerHTML = `
            <div class="profile-container">
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="fa fa-user"></i>
                    </div>
                    <div class="user-info">
                        <h3>Hi, ${this.capitalizeFirst(
                          userData.username || "#"
                        )}</h3>
                        <div class="user-email">
                            <i class="fa fa-envelope-open"></i>
                            <span>${userData.email || ""}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-options">
                    <div class="profile-option" onclick="ProfileView.showChangeUsername()">
                        <i class="fa fa-id-badge"></i>
                        <span>Change username</span>
                    </div>
                    <div class="profile-option" onclick="ProfileView.showChangeEmail()">
                        <i class="fa fa-envelope"></i>
                        <span>Change Email</span>
                    </div>
                    <div class="profile-option" onclick="ProfileView.showChangePassword()">
                        <i class="fa fa-key"></i>
                        <span>Change Password</span>
                    </div>
                </div>
                
                <button class="logout-btn" onclick="ProfileView.logout()">
                    <i class="fa fa-sign-out"></i>
                    Sign out
                </button>
            </div>
        `;
  },

  capitalizeFirst: function (str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  showChangeUsername: function () {
    App.controllers.profile.resetAll();
    this.renderChangeUsername();
  },

  showChangeEmail: function () {
    App.controllers.profile.resetAll();
    this.renderChangeEmail();
  },

  showChangePassword: function () {
    App.controllers.profile.resetAll();
    this.renderChangePassword();
  },

  renderChangeUsername: function () {
    const profile = App.controllers.profile;
    const container = document.getElementById("main-content");

    container.innerHTML = `
            <div class="change-form-container">
                <button class="back-button" onclick="App.navigateTo('profile')">
                    <i class="fa fa-arrow-left"></i> Back
                </button>
                
                <h2>Change Username</h2>
                
                <div class="form-group">
                    <label>New Username</label>
                    <div class="input-group ${
                      profile.userNameError ? "error-input" : ""
                    }">
                        <i class="fa fa-user"></i>
                        <input type="text" 
                               id="new-username" 
                               placeholder="Enter new username"
                               value="${profile.userNameController}">
                    </div>
                    ${
                      profile.userNameError
                        ? '<div class="error-message">Username must be filled</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <div class="input-group ${
                      profile.oldPassError || profile.oldPassWrong
                        ? "error-input"
                        : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          profile.oldPassObscure ? "password" : "text"
                        }" 
                               id="password-verify" 
                               placeholder="Enter password"
                               value="${profile.oldPassController}">
                        <i class="fa ${
                          profile.oldPassObscure ? "fa-eye" : "fa-eye-slash"
                        } toggle-password" 
                           onclick="ProfileView.togglePassword('oldPass')"></i>
                    </div>
                    ${
                      profile.oldPassError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                    ${
                      profile.oldPassWrong
                        ? '<div class="error-message">The password is wrong</div>'
                        : ""
                    }
                </div>
                
                <button class="btn-submit" onclick="ProfileView.submitUsernameChange()">
                    Change username
                </button>
            </div>
        `;

    this.setupFormListeners();
  },

  renderChangeEmail: function () {
    const profile = App.controllers.profile;
    const container = document.getElementById("main-content");

    container.innerHTML = `
            <div class="change-form-container">
                <button class="back-button" onclick="App.navigateTo('profile')">
                    <i class="fa fa-arrow-left"></i> Back
                </button>
                
                <h2>Change Email</h2>
                
                <div class="form-group">
                    <label>New Email</label>
                    <div class="input-group ${
                      profile.emailError ? "error-input" : ""
                    }">
                        <i class="fa fa-envelope"></i>
                        <input type="email" 
                               id="new-email" 
                               placeholder="Enter new email"
                               value="${profile.emailController}">
                    </div>
                    ${
                      profile.emailError
                        ? '<div class="error-message">Email must be filled correctly</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <div class="input-group ${
                      profile.oldPassError || profile.oldPassWrong
                        ? "error-input"
                        : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          profile.oldPassObscure ? "password" : "text"
                        }" 
                               id="password-verify" 
                               placeholder="Enter password"
                               value="${profile.oldPassController}">
                        <i class="fa ${
                          profile.oldPassObscure ? "fa-eye" : "fa-eye-slash"
                        } toggle-password" 
                           onclick="ProfileView.togglePassword('oldPass')"></i>
                    </div>
                    ${
                      profile.oldPassError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                    ${
                      profile.oldPassWrong
                        ? '<div class="error-message">The password is wrong</div>'
                        : ""
                    }
                </div>
                
                <button class="btn-submit" onclick="ProfileView.submitEmailChange()">
                    Change email
                </button>
            </div>
        `;

    this.setupFormListeners();
  },

  renderChangePassword: function () {
    const profile = App.controllers.profile;
    const container = document.getElementById("main-content");

    container.innerHTML = `
            <div class="change-form-container">
                <button class="back-button" onclick="App.navigateTo('profile')">
                    <i class="fa fa-arrow-left"></i> Back
                </button>
                
                <h2>Change Password</h2>
                
                <div class="form-group">
                    <label>Old password</label>
                    <div class="input-group ${
                      profile.oldPassError || profile.oldPassWrong
                        ? "error-input"
                        : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          profile.oldPassObscure ? "password" : "text"
                        }" 
                               id="old-password" 
                               placeholder="Enter old password"
                               value="${profile.oldPassController}">
                        <i class="fa ${
                          profile.oldPassObscure ? "fa-eye" : "fa-eye-slash"
                        } toggle-password" 
                           onclick="ProfileView.togglePassword('oldPass')"></i>
                    </div>
                    ${
                      profile.oldPassError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                    ${
                      profile.oldPassWrong
                        ? '<div class="error-message">The old password is wrong</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label>New password</label>
                    <div class="input-group ${
                      profile.newPassError ? "error-input" : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          profile.newPassObscure ? "password" : "text"
                        }" 
                               id="new-password" 
                               placeholder="Enter new password"
                               value="${profile.newPassController}">
                        <i class="fa ${
                          profile.newPassObscure ? "fa-eye" : "fa-eye-slash"
                        } toggle-password" 
                           onclick="ProfileView.togglePassword('newPass')"></i>
                    </div>
                    ${
                      profile.newPassError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label>Confirm new password</label>
                    <div class="input-group ${
                      profile.confNewPassError ? "error-input" : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          profile.confNewPassObscure ? "password" : "text"
                        }" 
                               id="confirm-password" 
                               placeholder="Enter new password"
                               value="${profile.confNewPassController}">
                        <i class="fa ${
                          profile.confNewPassObscure ? "fa-eye" : "fa-eye-slash"
                        } toggle-password" 
                           onclick="ProfileView.togglePassword('confNewPass')"></i>
                    </div>
                    ${
                      profile.confNewPassError
                        ? '<div class="error-message">Password must be the same</div>'
                        : ""
                    }
                </div>
                
                <button class="btn-submit" onclick="ProfileView.submitPasswordChange()">
                    Change password
                </button>
            </div>
        `;

    this.setupFormListeners();
  },

  setupFormListeners: function () {
    const profile = App.controllers.profile;

    // Username field
    const usernameInput = document.getElementById("new-username");
    if (usernameInput) {
      usernameInput.addEventListener("input", (e) => {
        profile.userNameController = e.target.value;
        if (e.target.value) {
          profile.userNameError = false;
        }
      });
    }

    // Email field
    const emailInput = document.getElementById("new-email");
    if (emailInput) {
      emailInput.addEventListener("input", (e) => {
        profile.emailController = e.target.value;
        if (e.target.value) {
          profile.emailError = false;
        }
      });
    }

    // Password fields
    const oldPasswordInput = document.getElementById("old-password");
    const passwordVerifyInput = document.getElementById("password-verify");

    if (oldPasswordInput || passwordVerifyInput) {
      const input = oldPasswordInput || passwordVerifyInput;
      input.addEventListener("input", (e) => {
        profile.oldPassController = e.target.value;
        if (e.target.value) {
          profile.oldPassError = false;
          profile.oldPassWrong = false;
        }
      });
    }

    const newPasswordInput = document.getElementById("new-password");
    if (newPasswordInput) {
      newPasswordInput.addEventListener("input", (e) => {
        profile.newPassController = e.target.value;
        if (e.target.value) {
          profile.newPassError = false;
        }
      });
    }

    const confirmPasswordInput = document.getElementById("confirm-password");
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", (e) => {
        profile.confNewPassController = e.target.value;
        profile.matchPass(e.target.value);
      });
    }
  },

  togglePassword: function (type) {
    const profile = App.controllers.profile;

    switch (type) {
      case "oldPass":
        profile.oldPassObscure = !profile.oldPassObscure;
        break;
      case "newPass":
        profile.newPassObscure = !profile.newPassObscure;
        break;
      case "confNewPass":
        profile.confNewPassObscure = !profile.confNewPassObscure;
        break;
    }

    // Re-render the current form
    if (document.getElementById("new-username")) {
      this.renderChangeUsername();
    } else if (document.getElementById("new-email")) {
      this.renderChangeEmail();
    } else if (document.getElementById("new-password")) {
      this.renderChangePassword();
    }
  },

  submitUsernameChange: function () {
    App.controllers.profile.checkFieldChangeUsername();
  },

  submitEmailChange: function () {
    App.controllers.profile.checkFieldChangeEmail();
  },

  submitPasswordChange: function () {
    App.controllers.profile.checkFieldChangePass();
  },

  logout: function () {
    App.controllers.profile.signOutFunction();
  },
};

// Add profile-specific styles
const profileStyles = `
<style>
.profile-container {
    padding: 20px;
    height: 100%;
    position: relative;
}

.change-form-container {
    padding: 20px;
}

.change-form-container h2 {
    color: #4CAF50;
    margin: 20px 0;
}

.btn-submit {
    width: 100%;
    height: 45px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 50px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    color: #4CAF50;
    display: block;
    margin-bottom: 5px;
}

.input-group {
    height: 45px;
    border: 1px solid #4CAF50;
    border-radius: 5px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    background: rgba(76, 175, 79, 0.1);
}

.input-group.error-input {
    border-color: #F44336;
}

.input-group input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    color: #2E7D32;
    font-family: 'Barlow', sans-serif;
}

.input-group i {
    color: #4CAF50;
    margin-right: 10px;
}

.toggle-password {
    cursor: pointer;
}

.error-message {
    color: #F44336;
    font-size: 12px;
    margin-top: 5px;
    text-align: right;
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById("profile-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "profile-styles";
  styleElement.innerHTML = profileStyles;
  document.head.appendChild(styleElement);
}
