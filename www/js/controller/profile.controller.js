// profile.controller.js - Profile Controller

class ProfileController {
  constructor() {
    this.oldPassObscure = true;
    this.oldPassController = "";
    this.oldPassError = false;
    this.oldPassWrong = false;
    this.newPassObscure = true;
    this.newPassController = "";
    this.newPassError = false;
    this.confNewPassObscure = true;
    this.confNewPassController = "";
    this.confNewPassError = false;
    this.emailController = "";
    this.emailError = false;
    this.userNameController = "";
    this.userNameError = false;
  }

  // Reset all fields
  resetAll() {
    this.oldPassObscure = true;
    this.oldPassController = "";
    this.oldPassError = false;
    this.oldPassWrong = false;
    this.newPassObscure = true;
    this.newPassController = "";
    this.newPassError = false;
    this.confNewPassObscure = true;
    this.confNewPassController = "";
    this.confNewPassError = false;
    this.emailController = "";
    this.emailError = false;
    this.userNameController = "";
    this.userNameError = false;
  }

  // Match password confirmation
  matchPass(value) {
    if (this.newPassController !== value) {
      this.confNewPassError = true;
    } else {
      this.confNewPassError = false;
    }
  }

  // Check fields for email change
  async checkFieldChangeEmail() {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (this.oldPassController.length === 0) {
      this.oldPassError = true;
      ProfileView.renderChangeEmail();
      return;
    }

    if (
      !emailRegex.test(this.emailController) ||
      this.emailController.length === 0
    ) {
      this.emailError = true;
      ProfileView.renderChangeEmail();
      return;
    }

    await this.handleChangeData({ email: this.emailController }, "email");
  }

  // Check fields for username change
  async checkFieldChangeUsername() {
    if (this.oldPassController.length === 0) {
      this.oldPassError = true;
      ProfileView.renderChangeUsername();
      return;
    }

    if (this.userNameController.length === 0) {
      this.userNameError = true;
      ProfileView.renderChangeUsername();
      return;
    }

    await this.handleChangeData(
      { data: { username: this.userNameController } },
      "username"
    );
  }

  // Check fields for password change
  async checkFieldChangePass() {
    if (this.oldPassController.length === 0) {
      this.oldPassError = true;
      ProfileView.renderChangePassword();
      return;
    }

    if (this.newPassController.length === 0) {
      this.newPassError = true;
      ProfileView.renderChangePassword();
      return;
    }

    if (
      this.confNewPassController.length === 0 ||
      this.confNewPassController !== this.newPassController
    ) {
      this.confNewPassError = true;
      ProfileView.renderChangePassword();
      return;
    }

    await this.handleChangeData(
      { password: this.newPassController },
      "password"
    );
  }

  // Handle data change
  async handleChangeData(attributes, dataChange) {
    App.showLoading();

    const reLogSuccess = await this.reLogin();
    if (!reLogSuccess) {
      this.oldPassWrong = true;
      App.hideLoading();
      if (dataChange === "email") {
        ProfileView.renderChangeEmail();
      } else if (dataChange === "username") {
        ProfileView.renderChangeUsername();
      } else {
        ProfileView.renderChangePassword();
      }
      return;
    }

    const result = await SupabaseService.updateUser(attributes);
    App.hideLoading();

    if (result.success) {
      App.controllers.auth.setUserData();
      App.showAlert(
        "Success!",
        `${dataChange} changed successfully`,
        "success"
      );
      setTimeout(() => {
        $("#alertModal").modal("hide");
        App.navigateTo("profile");
      }, 2000);
    } else {
      App.showAlert("Failed", result.error);
    }
  }

  // Re-login for verification
  async reLogin() {
    try {
      const auth = App.controllers.auth;
      const userEmail = auth.userData.email;

      const result = await SupabaseService.signIn(
        userEmail,
        this.oldPassController
      );
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Sign out function
  async signOutFunction() {
    App.showLoading();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = await SupabaseService.signOut();
    App.hideLoading();

    if (!result.success) {
      App.showAlert("Failed", "Something went wrong");
    }
    // Logout will be handled by auth state listener
  }
}
