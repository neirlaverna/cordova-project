// disease.view.js - Disease View

const DiseaseView = {
  currentPage: 1,
  isLoading: false,

  render: function (container) {
    const mainController = App.controllers.main;
    const filteredDiseases = mainController.getFilteredDiseases();

    container.innerHTML = `
            <div class="disease-container">
                ${this.renderSearchBar()}
                <div class="disease-grid" id="disease-grid">
                    ${this.renderDiseases(filteredDiseases)}
                </div>
                ${filteredDiseases.length === 0 ? this.renderEmptyState() : ""}
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
                     onclick="DiseaseView.activateSearch()">
                    <i class="fa fa-search search-icon"></i>
                    ${
                      mainController.searchActive
                        ? `<input type="text" 
                                id="disease-search" 
                                placeholder="Search diseases"
                                value="${mainController.searchValue}">`
                        : ""
                    }
                </div>
                <div class="family-filters">
                    ${mainController.diseaseFamily
                      .map(
                        (family) => `
                        <div class="family-filter ${
                          family.selected ? "active" : ""
                        }"
                             onclick="DiseaseView.selectFamily('${
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

  renderDiseases: function (diseases) {
    const dbController = App.controllers.db;
    const mainController = App.controllers.main;

    return diseases
      .map((disease) => {
        const image = mainController.getImage(disease.images || []);
        const otherNameList = disease.other_name || [];
        const otherName = otherNameList.join(", ");
        const isBookmarked = dbController.isDiseaseBookmarked(disease.id);

        return `
                <div class="disease-card" onclick="DiseaseView.viewDiseaseDetail(${JSON.stringify(
                  disease
                ).replace(/"/g, "&quot;")})">
                    ${
                      image
                        ? `<img src="${image}" 
                              class="disease-image" 
                              onerror="this.onerror=null; this.src='img/virus.png';">`
                        : `<div class="disease-image-loading"></div>`
                    }
                    <div class="disease-info">
                        <div class="disease-name">
                            ${disease.common_name}${
          otherName ? ` (${otherName})` : ""
        }
                        </div>
                    </div>
                    <i class="fa ${
                      isBookmarked ? "fa-bookmark" : "fa-bookmark-o"
                    } bookmark-btn"
                       onclick="event.stopPropagation(); DiseaseView.toggleBookmark(${
                         disease.id
                       }, ${isBookmarked})"></i>
                </div>
            `;
      })
      .join("");
  },

  renderEmptyState: function () {
    return `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: #999;">Disease data is not available at this time</h3>
            </div>
        `;
  },

  setupEventListeners: function () {
    const searchInput = document.getElementById("disease-search");
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
        await App.controllers.main.onFetchDiseaseDataPagination();
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
        document.getElementById("disease-search").focus();
      }, 100);
    }
  },

  selectFamily: function (familyName) {
    App.controllers.main.setSelectDiseaseFams(familyName);
    this.render(document.getElementById("main-content"));
  },

  async toggleBookmark(diseaseId, isBookmarked) {
    const disease = App.controllers.main.allDiseaseList.find(
      (d) => d.id === diseaseId
    );
    if (!disease) return;

    const mainController = App.controllers.main;
    const image = mainController.getImage(disease.images || []);

    const bookmarkData = {
      id: disease.id,
      common_name: disease.common_name,
      other_name: disease.other_name || [],
      family: disease.family,
      image: image,
    };

    if (isBookmarked) {
      await App.controllers.db.deleteDisBookmark(diseaseId);
    } else {
      await App.controllers.db.addDisBookMark(bookmarkData);
    }

    // Re-render to update bookmark status
    this.render(document.getElementById("main-content"));
  },

  viewDiseaseDetail: function (diseaseData) {
    DiseaseDetailView.render(
      document.getElementById("main-content"),
      diseaseData
    );
  },
};

// Disease Detail View
const DiseaseDetailView = {
  render: function (container, diseaseData) {
    const mainController = App.controllers.main;
    const image = mainController.getImage(diseaseData.images || []);
    const otherNames = diseaseData.other_name || [];

    container.innerHTML = `
            <div class="detail-container">
                <button class="back-button" onclick="App.navigateTo('disease')">
                    <i class="fa fa-arrow-left"></i> Back
                </button>
                
                <div class="detail-image">
                    ${
                      image
                        ? `<img src="${image}" onerror="this.onerror=null; this.src='img/virus.png';">`
                        : `<div class="image-placeholder">
                            <i class="fa fa-bug"></i>
                            <p>No image available</p>
                        </div>`
                    }
                </div>
                
                <div class="detail-section">
                    <label>Common name</label>
                    <h2>${diseaseData.common_name || "-"}</h2>
                </div>
                
                <div class="detail-section">
                    <label>Scientific Name</label>
                    <p>${diseaseData.scientific_name || "-"}</p>
                </div>
                
                ${
                  otherNames.length > 0
                    ? `
                    <div class="detail-section">
                        <label>Other name</label>
                        ${otherNames
                          .map(
                            (name, index) =>
                              `<p class="list-item">${index + 1}. ${name}</p>`
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
                
                ${
                  diseaseData.description && diseaseData.description.length > 0
                    ? diseaseData.description
                        .map(
                          (desc) => `
                        <div class="detail-section">
                            <h3 style="color: #333; font-weight: 600; font-size: 18px;">
                                ${desc.subtitle || ""}
                            </h3>
                            <p class="description">${desc.description || ""}</p>
                        </div>
                    `
                        )
                        .join("")
                    : ""
                }
                
                ${
                  diseaseData.solution && diseaseData.solution.length > 0
                    ? `
                    <div class="detail-section">
                        <label><i class="fa fa-question-circle"></i> Solution</label>
                        ${diseaseData.solution
                          .map(
                            (sol) => `
                            <div style="margin-bottom: 15px;">
                                <h3 style="color: #333; font-weight: 600; font-size: 18px;">
                                    ${sol.subtitle || ""}
                                </h3>
                                <p class="description">${
                                  sol.description || ""
                                }</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;
  },
};

// Add disease-specific styles
const diseaseStyles = `
<style>
.disease-container {
    padding: 10px;
}

.disease-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding-bottom: 20px;
}

.disease-card {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    position: relative;
    height: 250px;
}

.disease-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.disease-image-loading {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

.disease-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.6);
    color: white;
    padding: 10px;
    min-height: 100px;
}

.disease-name {
    font-weight: bold;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById("disease-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "disease-styles";
  styleElement.innerHTML = diseaseStyles;
  document.head.appendChild(styleElement);
}
