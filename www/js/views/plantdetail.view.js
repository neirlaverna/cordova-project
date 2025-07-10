// plantdetail.view.js - Plant Detail View

const PlantDetailView = {
  render: function (container) {
    const controller = App.controllers.plantDetail;

    if (controller.isLoading) {
      container.innerHTML = `
                <div class="loading-container">
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
                </div>
            `;
      return;
    }

    if (controller.isError) {
      container.innerHTML = `
                <div class="error-container">
                    <p>An error occurred while loading data</p>
                    <button onclick="PlantDetailView.goBack()">Go Back</button>
                </div>
            `;
      return;
    }

    const plant = controller.detailMap;
    const imageMap = plant.default_image || {};
    const image = imageMap.original_url || imageMap.thumbnail || "";
    const scientificNames = plant.scientific_name || [];
    const otherNames = plant.other_name || [];
    const pestSusceptibility = plant.pest_susceptibility || [];
    const pruningMonths = plant.pruning_month || [];

    container.innerHTML = `
            <div class="detail-container">
                <button class="back-button" onclick="PlantDetailView.goBack()">
                    <i class="fa fa-arrow-left"></i> Back
                </button>
                
                <div class="detail-image">
                    ${
                      image
                        ? `<img src="${image}" onerror="this.onerror=null; this.src='img/plant-logo.png';">`
                        : `<div class="image-placeholder">
                            <i class="fa fa-image"></i>
                            <p>No image available</p>
                        </div>`
                    }
                </div>
                
                <div class="detail-section">
                    <label>Common name</label>
                    <h2>${plant.common_name || "-"}</h2>
                </div>
                
                <div class="detail-section">
                    <label>Family</label>
                    <p>${plant.family || "-"}</p>
                </div>
                
                ${this.renderListSection("Other name", otherNames)}
                ${this.renderListSection("Scientific name", scientificNames)}
                
                <div class="detail-section">
                    <label>Overview</label>
                    <div class="overview-grid">
                        ${controller.plantWidget
                          .map(
                            (widget) => `
                            <div class="overview-item">
                                <i class="fa ${widget.icon}"></i>
                                <span class="overview-title">${widget.title}:</span>
                                <span class="overview-value">${widget.subtitle}</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                
                ${
                  pestSusceptibility.length > 0 || pruningMonths.length > 0
                    ? `
                    <div class="detail-row">
                        ${this.renderListSection(
                          "Pest susceptibility",
                          pestSusceptibility,
                          "fa-bug"
                        )}
                        ${this.renderListSection(
                          "Pruning month",
                          pruningMonths,
                          "fa-cut"
                        )}
                    </div>
                `
                    : ""
                }
                
                ${
                  plant.description
                    ? `
                    <div class="detail-section">
                        <label>Description</label>
                        <p class="description">${plant.description}</p>
                    </div>
                `
                    : ""
                }
                
                ${
                  plant.hardinessImgUrl
                    ? `
                    <div class="detail-section">
                        <label><i class="fa fa-map-marker"></i> Hardiness location</label>
                        <div class="hardiness-map">
                            <iframe src="${plant.hardinessImgUrl}" 
                                    width="100%" 
                                    height="300"
                                    frameborder="0">
                            </iframe>
                        </div>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  },

  renderListSection: function (title, items, icon) {
    if (!items || items.length === 0) return "";

    return `
            <div class="detail-section">
                <label>${
                  icon ? `<i class="fa ${icon}"></i> ` : ""
                }${title}</label>
                ${items
                  .map(
                    (item, index) =>
                      `<p class="list-item">${index + 1}. ${item}</p>`
                  )
                  .join("")}
            </div>
        `;
  },

  goBack: function () {
    // Reset plant detail controller
    App.controllers.plantDetail = null;

    // Navigate back to previous page
    if (App.currentPage === "bookmark") {
      BookmarkView.render(document.getElementById("main-content"));
    } else {
      App.navigateTo("home");
    }
  },
};

// Add detail-specific styles
const detailStyles = `
<style>
.detail-container {
    padding: 10px;
}

.back-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    margin-bottom: 10px;
    cursor: pointer;
}

.detail-image {
    width: 100%;
    height: 200px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.detail-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.detail-section {
    margin-bottom: 20px;
}

.detail-section label {
    color: #666;
    font-style: italic;
    display: block;
    margin-bottom: 5px;
}

.detail-section h2 {
    font-size: 25px;
    font-weight: bold;
    margin: 0;
}

.detail-section p {
    margin: 5px 0;
    padding-left: 10px;
}

.list-item {
    margin: 2px 0;
}

.overview-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 10px;
}

.overview-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
}

.overview-item i {
    width: 20px;
    text-align: center;
}

.overview-title {
    flex: 0 0 120px;
}

.overview-value {
    flex: 1;
}

.detail-row {
    display: flex;
    gap: 20px;
}

.detail-row .detail-section {
    flex: 1;
}

.description {
    text-align: justify;
}

.hardiness-map {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-container,
.error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-direction: column;
}

.error-container button {
    margin-top: 20px;
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById("detail-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "detail-styles";
  styleElement.innerHTML = detailStyles;
  document.head.appendChild(styleElement);
}
