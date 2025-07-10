// home.view.js - Home View

const HomeView = {
  currentPage: 1,
  isLoading: false,

  render: function (container) {
    const mainController = App.controllers.main;
    const filteredPlants = mainController.getFilteredPlants();

    container.innerHTML = `
            <div class="home-container">
                ${this.renderSearchBar()}
                <div class="plants-grid" id="plants-grid">
                    ${this.renderPlants(filteredPlants)}
                </div>
                ${filteredPlants.length === 0 ? this.renderEmptyState() : ""}
            </div>
        `;

    this.setupEventListeners();
    this.setupInfiniteScroll();
  },

  renderSearchBar: function () {
    const mainController = App.controllers.main;

    return `
            <div class="search-container">
                <div class="search-bar ${
                  mainController.searchActive ? "active" : ""
                }" 
                     onclick="HomeView.activateSearch()">
                    <i class="fa fa-search search-icon"></i>
                    ${
                      mainController.searchActive
                        ? `<input type="text" 
                                id="home-search" 
                                placeholder="Search plants"
                                value="${mainController.searchValue}">`
                        : ""
                    }
                </div>
                <div class="family-filters">
                    ${mainController.familyList
                      .map(
                        (family) => `
                        <div class="family-filter ${
                          family.selected ? "active" : ""
                        }"
                             onclick="HomeView.selectFamily('${
                               family.familyName
                             }')">
                            ${family.familyName}
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  },

  renderPlants: function (plants) {
    const dbController = App.controllers.db;

    return plants
      .map((plant) => {
        const imageMap = plant.default_image || {};
        const image =
          imageMap.medium_url ||
          imageMap.original_url ||
          imageMap.thumbnail ||
          "";
        const otherName = (plant.other_name || []).join(", ");
        const isBookmarked = dbController.isPlantBookmarked(plant.id);

        return `
                <div class="plant-card" onclick="HomeView.viewPlantDetail(${
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
                       onclick="event.stopPropagation(); HomeView.toggleBookmark(${
                         plant.id
                       }, ${isBookmarked})"></i>
                </div>
            `;
      })
      .join("");
  },

  renderEmptyState: function () {
    return `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: #999;">Plant data is not available at this time</h3>
                <p style="color: #4CAF50; cursor: pointer; margin-top: 20px;"
                   onclick="App.navigateTo('search')">
                    Tap this text to try searching by specific plant name
                </p>
            </div>
        `;
  },

  setupEventListeners: function () {
    const searchInput = document.getElementById("home-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        App.controllers.main.searchValue = e.target.value;
        this.render(document.getElementById("main-content"));
      });
    }
  },

  setupInfiniteScroll: function () {
    const mainContent = document.getElementById("main-content");

    mainContent.addEventListener("scroll", async () => {
      if (this.isLoading) return;

      const scrollTop = mainContent.scrollTop;
      const scrollHeight = mainContent.scrollHeight;
      const clientHeight = mainContent.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.isLoading = true;
        await App.controllers.main.onFetchDataPagination();
        this.render(mainContent);
        this.isLoading = false;
      }
    });
  },

  activateSearch: function () {
    const mainController = App.controllers.main;
    if (!mainController.searchActive) {
      mainController.searchActive = true;
      this.render(document.getElementById("main-content"));
      setTimeout(() => {
        document.getElementById("home-search").focus();
      }, 100);
    }
  },

  selectFamily: function (familyName) {
    App.controllers.main.setSelectFams(familyName);
    this.render(document.getElementById("main-content"));
  },

  async toggleBookmark(plantId, isBookmarked) {
    const plant = App.controllers.main.allPlantData.find(
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
    this.render(document.getElementById("main-content"));
  },

  viewPlantDetail: function (plantId) {
    App.controllers.plantDetail = new PlantDetailController();
    App.controllers.plantDetail.getPlantDetail(plantId).then(() => {
      PlantDetailView.render(document.getElementById("main-content"));
    });
  },
};
