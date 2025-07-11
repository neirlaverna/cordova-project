// search.controller.js - Search Controller

class SearchController {
  constructor() {
    this.suggestions = [];
    this.suggestShow = [];
    this.searchLabel = "Search by specific plant name";
    this.searchResult = [];
    this.control = "";
    this.onSuggestTap = false;
  }

  // Initialize suggestions
  initialize() {
    this.setSuggestion();
  }

  // Set text field value
  setTextField(value) {
    this.onSuggestTap = true;
    this.control = value;
  }

  // Search suggestions
  searchSuggest(value) {
    let suggestList = [];

    if (value.length > 0) {
      suggestList = this.suggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
    }

    this.suggestShow = suggestList;
  }

  // Set suggestions from plant data
  setSuggestion() {
    const mainController = App.controllers.main;
    const suggest = new Set();

    mainController.allPlantData.forEach((plant) => {
      // Add common name
      if (plant.common_name) {
        suggest.add(plant.common_name);
      }

      // Add scientific names
      if (plant.scientific_name && Array.isArray(plant.scientific_name)) {
        plant.scientific_name.forEach((name) => {
          if (name) suggest.add(name);
        });
      }

      // Add other names
      if (plant.other_name && Array.isArray(plant.other_name)) {
        plant.other_name.forEach((name) => {
          if (name) suggest.add(name);
        });
      }
    });

    this.suggestions = Array.from(suggest);
  }

  // Set search results
  setSearchResult() {
    const mainController = App.controllers.main;
    const search = this.control.toLowerCase();

    const filtered = mainController.allPlantData.filter((plant) => {
      const commonName = (plant.common_name || "").toLowerCase();
      const scientificName = (plant.scientific_name || [])
        .toString()
        .toLowerCase();
      const otherName = (plant.other_name || []).toString().toLowerCase();

      return (
        commonName.includes(search) ||
        scientificName.includes(search) ||
        otherName.includes(search)
      );
    });

    this.searchResult = filtered;
    this.suggestShow = [];
  }

  // Fetch plant search from API
  async fetchPlantSearch() {
    try {
      const search = this.control;
      if (!search) return;

      const response = await fetch(
        `https://perenual.com/api/v2/species-list?key=sk-RDDs68285968befa710005&q=${encodeURIComponent(
          search
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        const mainController = App.controllers.main;
        const allList = [...mainController.allPlantData];
        const searchResults = [...this.searchResult];

        data.data.forEach((plant) => {
          // Add to search results if not already there
          if (!searchResults.some((p) => p.id === plant.id)) {
            searchResults.push(plant);
          }

          // Add to main list if not already there
          if (!allList.some((p) => p.id === plant.id)) {
            allList.push(plant);
          }
        });

        mainController.allPlantData = allList;
        this.searchResult = searchResults;

        // Update suggestions
        this.setSuggestion();
      }
    } catch (error) {
      console.error("Error fetching plant search:", error);
    }
  }
}
