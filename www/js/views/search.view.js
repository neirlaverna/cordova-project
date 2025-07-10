// search.view.js - Search View

const SearchView = {
  render: function (container) {
    const searchController = App.controllers.search;

    container.innerHTML = `
            <div class="search-page-container">
                <div class="search-header">
                    <div class="search-input-container">
                        <div class="search-input-box">
                            <input type="text" 
                                   id="search-input" 
                                   placeholder="${searchController.searchLabel}"
                                   value="${searchController.control}"
                                   autocomplete="off">
                        </div>
                        <button class="search-button" onclick="SearchView.performSearch()">
                            <i class="fa fa-search"></i>
                        </button>
                    </div>
                    
                    <div class="search-suggestions ${
                      searchController.onSuggestTap ||
                      searchController.suggestShow.length === 0
                        ? "hidden"
                        : ""
                    }" 
                         id="search-suggestions">
                        ${searchController.suggestShow
                          .map(
                            (suggest) => `
                            <div class="suggestion-item" onclick="SearchView.selectSuggestion('${suggest}')">
                                ${suggest}
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="search-results" id="search-results">
                    ${this.renderSearchResults()}
                </div>
            </div>
        `;

    this.setupEventListeners();
  },

  renderSearchResults: function () {
    const searchController = App.controllers.search;
    const dbController = App.controllers.db;

    if (searchController.searchResult.length === 0) {
      return '<div class="empty-results">Search for plants by their specific names</div>';
    }

    return `
            <div class="plants-grid">
                ${searchController.searchResult
                  .map((plant) => {
                    const imageMap = plant.default_image || {};
                    const image =
                      imageMap.medium_url ||
                      imageMap.original_url ||
                      imageMap.thumbnail ||
                      "";
                    const otherName = (plant.other_name || []).join(", ");
                    const isBookmarked = dbController.isPlantBookmarked(
                      plant.id
                    );

                    return `
                        <div class="plant-card" onclick="SearchView.viewPlantDetail(${
                          plant.id
                        })">
                            ${
                              image
                                ? `<img src="${image}" 
                                      class="plant-image" 
                                      onerror="this.onerror=null; this.src='img/plant-logo.png';">`
                                : `<div class="plant-image-loading"></div>`
                            }
                            <div class="plant-info">
                                <div class="plant-name">
                                    ${plant.common_name}${
                      otherName ? ` (${otherName})` : ""
                    }
                                </div>
                                <div class="plant-family">Family: ${
                                  plant.family || "-"
                                }</div>
                            </div>
                            <i class="fa ${
                              isBookmarked ? "fa-bookmark" : "fa-bookmark-o"
                            } bookmark-btn"
                               onclick="event.stopPropagation(); SearchView.toggleBookmark(${
                                 plant.id
                               }, ${isBookmarked})"></i>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        `;
  },

  setupEventListeners: function () {
    const searchController = App.controllers.search;
    const searchInput = document.getElementById("search-input");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchController.control = e.target.value;
        searchController.onSuggestTap = false;
        searchController.searchSuggest(e.target.value);
        searchController.searchResult = [];
        this.updateSuggestions();
        this.updateResults();
      });

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch();
        }
      });
    }
  },

  updateSuggestions: function () {
    const searchController = App.controllers.search;
    const suggestionsContainer = document.getElementById("search-suggestions");

    if (suggestionsContainer) {
      if (
        searchController.onSuggestTap ||
        searchController.suggestShow.length === 0
      ) {
        suggestionsContainer.classList.add("hidden");
      } else {
        suggestionsContainer.classList.remove("hidden");
        suggestionsContainer.innerHTML = searchController.suggestShow
          .map(
            (suggest) => `
                    <div class="suggestion-item" onclick="SearchView.selectSuggestion('${suggest}')">
                        ${suggest}
                    </div>
                `
          )
          .join("");
      }
    }
  },

  updateResults: function () {
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.innerHTML = this.renderSearchResults();
    }
  },

  selectSuggestion: function (value) {
    const searchController = App.controllers.search;
    searchController.setTextField(value);
    document.getElementById("search-input").value = value;
    searchController.setSearchResult();
    this.updateSuggestions();
    this.updateResults();
  },

  async performSearch() {
    const searchController = App.controllers.search;

    if (searchController.control.length === 0) return;

    if (searchController.suggestShow.length === 0) {
      searchController.onSuggestTap = true;
      App.showLoading();
      await searchController.fetchPlantSearch();
      App.hideLoading();
    } else {
      searchController.setSearchResult();
    }

    this.updateSuggestions();
    this.updateResults();
  },

  async toggleBookmark(plantId, isBookmarked) {
    const plant = App.controllers.search.searchResult.find(
      (p) => p.id === plantId
    );
    if (!plant) return;

    const imageMap = plant.default_image || {};
    const image =
      imageMap.medium_url || imageMap.original_url || imageMap.thumbnail || "";

    const bookmarkData = {
      id: plant.id,
      common_name: plant.common_name,
      other_name: plant.other_name,
      family: plant.family,
      image: image,
    };

    if (isBookmarked) {
      await App.controllers.db.deleteBookmark(plantId);
    } else {
      await App.controllers.db.addBookMark(bookmarkData);
    }

    // Re-render to update bookmark status
    this.updateResults();
  },

  viewPlantDetail: function (plantId) {
    App.controllers.plantDetail = new PlantDetailController();
    App.controllers.plantDetail.getPlantDetail(plantId).then(() => {
      PlantDetailView.render(document.getElementById("main-content"));
    });
  },
};

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
        `https://perenual.com/api/v2/species-list?key=sk-DtaQ6815b9a82c0d210195&q=${encodeURIComponent(
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
      }
    } catch (error) {
      console.error("Error fetching plant search:", error);
    }
  }
}

// Add search-specific styles
const searchStyles = `
<style>
.search-page-container {
    padding: 10px;
    position: relative;
}

.search-header {
    position: relative;
    margin-bottom: 20px;
}

.search-input-container {
    display: flex;
    gap: 10px;
}

.search-input-box {
    flex: 1;
    height: 45px;
    background: rgba(76, 175, 79, 0.3);
    border-radius: 20px;
    padding: 0 20px;
    display: flex;
    align-items: center;
}

.search-input-box input {
    width: 100%;
    border: none;
    background: none;
    outline: none;
    color: #2E7D32;
    font-family: 'Barlow', sans-serif;
    font-size: 16px;
}

.search-button {
    width: 50px;
    height: 45px;
    background: #4CAF50;
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-suggestions {
    position: absolute;
    top: 50px;
    left: 0;
    right: 60px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
}

.search-suggestions.hidden {
    display: none;
}

.suggestion-item {
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 0.5px solid #4CAF50;
}

.suggestion-item:hover {
    background: rgba(76, 175, 79, 0.1);
}

.suggestion-item:last-child {
    border-bottom: none;
}

.search-results {
    margin-top: 20px;
}

.empty-results {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 18px;
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById("search-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "search-styles";
  styleElement.innerHTML = searchStyles;
  document.head.appendChild(styleElement);
}
