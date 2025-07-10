// auth.view.js - Authentication View

const AuthView = {
  render: function () {
    const container = document.getElementById("auth-wrapper");
    const loginController = App.controllers.login;

    container.innerHTML = `
            <div class="auth-container">
                <div class="auth-circle ${
                  loginController.showLogin ? "login" : "register"
                }"></div>
                
                <div class="auth-logo ${
                  !loginController.showLogin ? "register-mode" : ""
                }">
                    <img src="img/plant-logo.png" alt="Logo">
                    <span class="auth-logo-title">Plantarium</span>
                </div>
                
                <div class="auth-title-register" style="position: absolute; top: 100px; width: 100%; text-align: center; opacity: ${
                  loginController.showLogin ? "0" : "1"
                }">
                    <h2 style="color: white; font-weight: bold;">Register</h2>
                </div>
                
                ${this.renderLoginForm()}
                ${this.renderRegisterForm()}
            </div>
        `;

    this.setupEventListeners();
  },

  renderLoginForm: function () {
    const loginController = App.controllers.login;

    return `
            <div class="auth-form login-form ${
              !loginController.showLogin ? "hidden" : ""
            }">
                <h2 class="form-title">Login</h2>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <div class="input-group ${
                      loginController.emailError ? "error-input" : ""
                    }">
                        <i class="fa fa-envelope"></i>
                        <input type="email" 
                               id="login-email" 
                               placeholder="Enter email"
                               value="${loginController.emailController}">
                    </div>
                    ${
                      loginController.emailError
                        ? '<div class="error-message">Email must be filled correctly</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <div class="input-group ${
                      loginController.passwordError ? "error-input" : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          loginController.obscurePassword ? "password" : "text"
                        }" 
                               id="login-password" 
                               placeholder="Enter password"
                               value="${loginController.passwordController}">
                        <i class="fa ${
                          loginController.obscurePassword
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } toggle-password" 
                           onclick="AuthView.togglePassword('login')"></i>
                    </div>
                    ${
                      loginController.passwordError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                </div>
                
                <div class="forgot-password">
                    <a href="#">Change password</a>
                </div>
                
                <button class="btn-auth" onclick="AuthView.handleLogin()">Login</button>
                
                <button class="btn-auth btn-social">
                    <i class="fa fa-google"></i>
                    Login with Google
                </button>
                
                <button class="btn-auth btn-social">
                    <i class="fa fa-github"></i>
                    Login with Github
                </button>
                
                <div class="auth-switch">
                    Don't have an account? 
                    <a href="#" onclick="AuthView.switchToRegister()">Sign up</a>
                </div>
            </div>
        `;
  },

  renderRegisterForm: function () {
    const loginController = App.controllers.login;

    return `
            <div class="auth-form register-form ${
              loginController.showLogin ? "hidden" : ""
            }">
                <h2 class="form-title">Form Register</h2>
                
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <div class="input-group ${
                      loginController.usernameError ? "error-input" : ""
                    }">
                        <i class="fa fa-user"></i>
                        <input type="text" 
                               id="register-username" 
                               placeholder="Enter username"
                               value="${loginController.usernameController}">
                    </div>
                    ${
                      loginController.usernameError
                        ? '<div class="error-message">Username must be filled</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <div class="input-group ${
                      loginController.emailError ? "error-input" : ""
                    }">
                        <i class="fa fa-envelope"></i>
                        <input type="email" 
                               id="register-email" 
                               placeholder="Enter email"
                               value="${loginController.emailController}">
                    </div>
                    ${
                      loginController.emailError
                        ? '<div class="error-message">Email must be filled correctly</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <div class="input-group ${
                      loginController.passwordError ? "error-input" : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          loginController.obscurePassword ? "password" : "text"
                        }" 
                               id="register-password" 
                               placeholder="Enter password"
                               value="${loginController.passwordController}">
                        <i class="fa ${
                          loginController.obscurePassword
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } toggle-password" 
                           onclick="AuthView.togglePassword('register')"></i>
                    </div>
                    ${
                      loginController.passwordError
                        ? '<div class="error-message">Password must be filled</div>'
                        : ""
                    }
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirm Password</label>
                    <div class="input-group ${
                      loginController.passwordConfError ? "error-input" : ""
                    }">
                        <i class="fa fa-key"></i>
                        <input type="${
                          loginController.obscurePasswordConfirm
                            ? "password"
                            : "text"
                        }" 
                               id="register-password-confirm" 
                               placeholder="Re-Enter password"
                               value="${
                                 loginController.passwordConfController
                               }">
                        <i class="fa ${
                          loginController.obscurePasswordConfirm
                            ? "fa-eye"
                            : "fa-eye-slash"
                        } toggle-password" 
                           onclick="AuthView.togglePasswordConfirm()"></i>
                    </div>
                    ${
                      loginController.passwordConfError
                        ? '<div class="error-message">Password must be the same</div>'
                        : ""
                    }
                </div>
                
                <button class="btn-auth" onclick="AuthView.handleRegister()">Sign Up</button>
                
                <div class="auth-switch">
                    Already have an account? 
                    <a href="#" onclick="AuthView.switchToLogin()">Login</a>
                </div>
            </div>
        `;
  },

  setupEventListeners: function () {
    const loginController = App.controllers.login;

    // Login form inputs
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");

    if (loginEmail) {
      loginEmail.addEventListener("input", (e) => {
        loginController.emailController = e.target.value;
        if (e.target.value) {
          loginController.emailError = false;
          this.updateErrors();
        }
      });
    }

    if (loginPassword) {
      loginPassword.addEventListener("input", (e) => {
        loginController.passwordController = e.target.value;
        if (e.target.value) {
          loginController.passwordError = false;
          this.updateErrors();
        }
      });
    }

    // Register form inputs
    const registerUsername = document.getElementById("register-username");
    const registerEmail = document.getElementById("register-email");
    const registerPassword = document.getElementById("register-password");
    const registerPasswordConfirm = document.getElementById(
      "register-password-confirm"
    );

    if (registerUsername) {
      registerUsername.addEventListener("input", (e) => {
        loginController.usernameController = e.target.value;
        if (e.target.value) {
          loginController.usernameError = false;
          this.updateErrors();
        }
      });
    }

    if (registerEmail) {
      registerEmail.addEventListener("input", (e) => {
        loginController.emailController = e.target.value;
        if (e.target.value) {
          loginController.emailError = false;
          this.updateErrors();
        }
      });
    }

    if (registerPassword) {
      registerPassword.addEventListener("input", (e) => {
        loginController.passwordController = e.target.value;
        if (e.target.value) {
          loginController.passwordError = false;
          this.updateErrors();
        }
      });
    }

    if (registerPasswordConfirm) {
      registerPasswordConfirm.addEventListener("input", (e) => {
        loginController.passwordConfController = e.target.value;
        loginController.passwordCheck(e.target.value);
        this.updateErrors();
      });
    }
  },

  updateErrors: function () {
    this.render();
  },

  togglePassword: function (form) {
    const loginController = App.controllers.login;
    loginController.obscurePassword = !loginController.obscurePassword;
    this.render();
  },

  togglePasswordConfirm: function () {
    const loginController = App.controllers.login;
    loginController.obscurePasswordConfirm =
      !loginController.obscurePasswordConfirm;
    this.render();
  },

  switchToRegister: function () {
    App.controllers.login.setShowLogin(false);
  },

  switchToLogin: function () {
    App.controllers.login.setShowLogin(true);
  },

  handleLogin: function () {
    App.controllers.login.loginCheckField();
  },

  handleRegister: function () {
    App.controllers.login.signUpCheckField();
  },
};
