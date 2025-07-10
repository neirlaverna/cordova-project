// app.js - Main Application Controller

const App = {
  currentUser: null,
  currentPage: "home",
  controllers: {},
  views: {},

  // Initialize app
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },

  // Device ready handler
  onDeviceReady: function () {
    console.log("Device is ready");

    // Initialize StatusBar
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Initialize Supabase
    SupabaseService.initialize();

    // Initialize Controllers
    this.initializeControllers();

    // Check authentication
    this.checkAuth();

    // Setup navigation
    this.setupNavigation();

    // Hide loading screen
    setTimeout(() => {
      document.getElementById("loading-screen").style.display = "none";
    }, 1000);
  },

  // Initialize all controllers
  initializeControllers: function () {
    this.controllers.auth = new AuthController();
    this.controllers.login = new LoginController();
    this.controllers.main = new MainController();
    this.controllers.db = new DbController();
    this.controllers.profile = new ProfileController();
    this.controllers.search = new SearchController();
    this.controllers.plantDetail = new PlantDetailController();
  },

  // Check authentication status
  checkAuth: function () {
    const user = this.controllers.auth.getCurrentUser();
    if (user) {
      this.showMainApp();
    } else {
      this.showAuthScreen();
    }
  },

  // Show authentication screen
  showAuthScreen: function () {
    document.getElementById("auth-wrapper").style.display = "block";
    document.getElementById("main-app").style.display = "none";
    AuthView.render();
  },

  // Show main application
  showMainApp: function () {
    document.getElementById("auth-wrapper").style.display = "none";
    document.getElementById("main-app").style.display = "block";

    // Initialize main controller data
    this.controllers.main.initialize();
    this.controllers.db.initialize();

    // Load home page
    this.navigateTo("home");
  },

  // Setup navigation
  setupNavigation: function () {
    // Bottom navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const page = item.getAttribute("data-page");
        this.navigateTo(page);
      });
    });
  },

  // Navigate to page
  navigateTo: function (page) {
    // Update current page
    this.currentPage = page;

    // Update navigation UI
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelector(`[data-page="${page}"]`).classList.add("active");

    // Update page title
    const titles = {
      home: "Home",
      bookmark: "Bookmark",
      disease: "Plant Disease",
      search: "Specific Search",
      profile: "Profile",
    };
    document.getElementById("page-title").textContent = titles[page];

    // Clear search if navigating away
    if (page !== "home" && page !== "disease") {
      this.controllers.main.searchActive = false;
      this.controllers.main.searchValue = "";
    }

    // Render page
    this.renderPage(page);
  },

  // Render page content
  renderPage: function (page) {
    const mainContent = document.getElementById("main-content");

    switch (page) {
      case "home":
        HomeView.render(mainContent);
        break;
      case "bookmark":
        BookmarkView.render(mainContent);
        break;
      case "disease":
        DiseaseView.render(mainContent);
        break;
      case "search":
        SearchView.render(mainContent);
        break;
      case "profile":
        ProfileView.render(mainContent);
        break;
    }
  },

  // Show alert
  showAlert: function (title, message, type = "error") {
    const modal = $("#alertModal");
    const animationContainer = document.getElementById("alert-animation");

    // Set title and message
    document.getElementById("alert-title").textContent = title;
    document.getElementById("alert-message").textContent = message;

    // Set animation
    const animationFile =
      type === "success" ? "check_animation.json" : "cross_animation.json";
    animationContainer.innerHTML = `
            <lottie-player src="lottie/${animationFile}" 
                background="transparent" 
                speed="1" 
                style="width: 100%; height: 100%;" 
                autoplay>
            </lottie-player>
        `;

    // Show modal
    modal.modal("show");
  },

  // Show loading
  showLoading: function () {
    const loading = document.createElement("div");
    loading.id = "app-loading";
    loading.className = "loading-screen";
    loading.innerHTML = `
            <div class="loading-content">
                <lottie-player src="lottie/plant_loading.json" 
                    background="transparent" 
                    speed="0.8" 
                    style="width: 90px; height: 90px;" 
                    loop 
                    autoplay>
                </lottie-player>
                <p class="loading-text">loading...</p>
            </div>
        `;
    document.body.appendChild(loading);
  },

  // Hide loading
  hideLoading: function () {
    const loading = document.getElementById("app-loading");
    if (loading) {
      loading.remove();
    }
  },

  // Logout
  logout: function () {
    this.showLoading();
    setTimeout(() => {
      this.controllers.auth.logout();
      this.hideLoading();
      this.showAuthScreen();
    }, 300);
  },
};

// Initialize app
App.initialize();
