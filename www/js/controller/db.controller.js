// db.controller.js - Database Controller

class DbController {
  constructor() {
    this.bookMarkPlantList = [];
    this.bookMarkDiseaseList = [];
    this.search = "";
    this.plantChannel = null;
    this.diseaseChannel = null;
  }

  // Initialize controller
  async initialize() {
    await this.bookMarkRealTimeListener();
    await this.fetchBookmark();
    await this.fetchDisBookmark();
  }

  // Add plant bookmark
  async addBookMark(plantMap) {
    try {
      const auth = App.controllers.auth;
      const mapAdd = {
        ...plantMap,
        usermark: auth.userData.sub || auth.userData.id,
      };

      const result = await SupabaseService.addBookmark(
        "plant_species_bookmark",
        mapAdd
      );

      if (!result.success) {
        App.showAlert("Error", "Something went wrong on add bookmark");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      App.showAlert("Error", "Something went wrong on add bookmark");
    }
  }

  // Add disease bookmark
  async addDisBookMark(diseaseMap) {
    try {
      const auth = App.controllers.auth;
      const mapAdd = {
        ...diseaseMap,
        usermark: auth.userData.sub || auth.userData.id,
      };

      const result = await SupabaseService.addBookmark(
        "plant_disease_bookmark",
        mapAdd
      );

      if (!result.success) {
        App.showAlert("Error", "Something went wrong on add bookmark");
      }
    } catch (error) {
      console.error("Error adding disease bookmark:", error);
      App.showAlert("Error", "Something went wrong on add bookmark");
    }
  }

  // Delete plant bookmark
  async deleteBookmark(id) {
    try {
      const auth = App.controllers.auth;
      const userSubs = auth.userData.sub || auth.userData.id;

      const result = await SupabaseService.deleteBookmark(
        "plant_species_bookmark",
        id,
        userSubs
      );

      if (result.success) {
        await this.fetchBookmark();
      } else {
        App.showAlert("Error", "Something went wrong on delete bookmark");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      App.showAlert("Error", "Something went wrong on delete bookmark");
    }
  }

  // Delete disease bookmark
  async deleteDisBookmark(id) {
    try {
      const auth = App.controllers.auth;
      const userSubs = auth.userData.sub || auth.userData.id;

      const result = await SupabaseService.deleteBookmark(
        "plant_disease_bookmark",
        id,
        userSubs
      );

      if (result.success) {
        await this.fetchDisBookmark();
      } else {
        App.showAlert("Error", "Something went wrong on delete bookmark");
      }
    } catch (error) {
      console.error("Error deleting disease bookmark:", error);
      App.showAlert("Error", "Something went wrong on delete bookmark");
    }
  }

  // Fetch plant bookmarks
  async fetchBookmark() {
    try {
      const auth = App.controllers.auth;
      const userSubs = auth.userData.sub || auth.userData.id;

      const result = await SupabaseService.fetchBookmarks(
        "plant_species_bookmark",
        userSubs
      );

      if (result.success) {
        this.bookMarkPlantList = result.data || [];
        // Re-render if on bookmark page
        if (App.currentPage === "bookmark") {
          BookmarkView.render(document.getElementById("main-content"));
        }
      } else {
        App.showAlert("Error", "Something went wrong on fetch bookmark");
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      App.showAlert("Error", "Something went wrong on fetch bookmark");
    }
  }

  // Fetch disease bookmarks
  async fetchDisBookmark() {
    try {
      const auth = App.controllers.auth;
      const userSubs = auth.userData.sub || auth.userData.id;

      const result = await SupabaseService.fetchBookmarks(
        "plant_disease_bookmark",
        userSubs
      );

      if (result.success) {
        this.bookMarkDiseaseList = result.data || [];
        // Re-render if on bookmark page
        if (App.currentPage === "bookmark") {
          BookmarkView.render(document.getElementById("main-content"));
        }
      } else {
        App.showAlert("Error", "Something went wrong on fetch bookmark");
      }
    } catch (error) {
      console.error("Error fetching disease bookmarks:", error);
      App.showAlert("Error", "Something went wrong on fetch bookmark");
    }
  }

  // Setup realtime listeners
  async bookMarkRealTimeListener() {
    try {
      const auth = App.controllers.auth;
      const userSubs = auth.userData.sub || auth.userData.id;

      // Plant bookmarks listener
      this.plantChannel = SupabaseService.subscribeToChanges(
        "plant_species_bookmark",
        userSubs,
        async (payload) => {
          await this.fetchBookmark();
        }
      );

      // Disease bookmarks listener
      this.diseaseChannel = SupabaseService.subscribeToChanges(
        "plant_disease_bookmark",
        userSubs,
        async (payload) => {
          await this.fetchDisBookmark();
        }
      );
    } catch (error) {
      console.error("Error setting up realtime listeners:", error);
      App.showAlert("Error", "Something went wrong on listen bookmark data");
    }
  }

  // Check if plant is bookmarked
  isPlantBookmarked(id) {
    return this.bookMarkPlantList.some((mark) => mark.id === id);
  }

  // Check if disease is bookmarked
  isDiseaseBookmarked(id) {
    return this.bookMarkDiseaseList.some((mark) => mark.id === id);
  }

  // Get filtered bookmarks
  getFilteredBookmarks() {
    if (!this.search) {
      return this.bookMarkPlantList;
    }

    return this.bookMarkPlantList.filter((plant) => {
      const commonName = (plant.common_name || "").toLowerCase();
      const scientificName = (plant.scientific_name || "")
        .toString()
        .toLowerCase();
      const otherName = (plant.other_name || "").toString().toLowerCase();
      const searchTerm = this.search.toLowerCase();

      return (
        commonName.includes(searchTerm) ||
        scientificName.includes(searchTerm) ||
        otherName.includes(searchTerm)
      );
    });
  }
}
