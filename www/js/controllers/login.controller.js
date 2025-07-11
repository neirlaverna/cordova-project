// login.controller.js - Login Controller

class LoginController {
  constructor() {
    this.showLogin = true;
    this.obscurePassword = true;
    this.obscurePasswordConfirm = true;
    this.emailError = false;
    this.passwordError = false;
    this.passwordConfError = false;
    this.usernameError = false;
    this.emailController = "";
    this.passwordController = "";
    this.usernameController = "";
    this.passwordConfController = "";
  }

  // Toggle between login and register
  setShowLogin(value) {
    this.showLogin = value;
    this.clearFields();
    AuthView.render();
  }

  // Clear all fields
  clearFields() {
    this.emailController = "";
    this.passwordController = "";
    this.usernameController = "";
    this.passwordConfController = "";
    this.obscurePassword = true;
    this.obscurePasswordConfirm = true;
    this.emailError = false;
    this.passwordError = false;
    this.passwordConfError = false;
    this.usernameError = false;
  }

  // Password confirmation check
  passwordCheck(value) {
    if (value !== this.passwordController) {
      this.passwordConfError = true;
    } else {
      this.passwordConfError = false;
    }
  }

  // Login validation and submission
  async loginCheckField() {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailRegex.test(this.emailController)) {
      this.emailError = true;
      AuthView.updateErrors();
      return;
    }

    if (this.passwordController.length === 0) {
      this.passwordError = true;
      AuthView.updateErrors();
      return;
    }

    await this.loginUser();
  }

  // Register validation and submission
  async signUpCheckField() {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (this.usernameController.length === 0) {
      this.usernameError = true;
      AuthView.updateErrors();
      return;
    }

    if (!emailRegex.test(this.emailController)) {
      this.emailError = true;
      AuthView.updateErrors();
      return;
    }

    if (this.passwordController.length === 0) {
      this.passwordError = true;
      AuthView.updateErrors();
      return;
    }

    if (this.passwordConfController.length === 0 || this.passwordConfError) {
      this.passwordConfError = true;
      AuthView.updateErrors();
      return;
    }

    await this.registerUser();
  }

  // Login user
  async loginUser() {
    App.showLoading();

    const result = await SupabaseService.signIn(
      this.emailController,
      this.passwordController
    );

    App.hideLoading();

    if (result.success) {
      // Success handled by auth state listener
    } else {
      if (result.error.includes("Invalid login credentials")) {
        App.showAlert("Failed", "Login failed, wrong email or password");
      } else {
        App.showAlert("Failed", "Login failed, account not registered");
      }
    }
  }

  // Register user
  async registerUser() {
    App.showLoading();

    const result = await SupabaseService.signUp(
      this.emailController,
      this.passwordController,
      this.usernameController
    );

    App.hideLoading();

    if (result.success) {
      App.showAlert(
        "Success",
        "Registration successful, return to login page to continue",
        "success"
      );
      setTimeout(() => {
        $("#alertModal").modal("hide");
        this.setShowLogin(true);
      }, 2000);
    } else {
      if (result.error.includes("User already registered")) {
        App.showAlert("Failed", "This email has been used");
      } else {
        App.showAlert("Failed", "An error occurred while registering");
      }
    }
  }
}
