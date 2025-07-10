// bookmark.view.js - Bookmark View

const BookmarkView = {
  render: function (container) {
    const dbController = App.controllers.db;
    const filteredBookmarks = dbController.getFilteredBookmarks();

    container.innerHTML = `
            <div class="bookmark-container">
                ${this.renderSearchBar()}
                <div class="bookmarks-list">
                    ${this.renderBookmarks(filteredBookmarks)}
                </div>
                ${
                  filteredBookmarks.length === 0 && !dbController.search
                    ? '<div class="empty-state">No bookmarked plants yet</div>'
                    : ""
                }
                ${
                  filteredBookmarks.length === 0 && dbController.search
                    ? '<div class="empty-state">No plants found matching your search</div>'
                    : ""
                }
            </div>
        `;

    this.setupEventListeners();
  },

  renderSearchBar: function () {
    const dbController = App.controllers.db;

    return `
            <div style="margin-bottom: 10px;">
                <div style="height: 45px; background: rgba(76, 175, 79, 0.3); 
                            border-radius: 20px; display: flex; align-items: center; padding: 0 15px;">
                    <i class="fa fa-search" style="color: #2E7D32; margin-right: 10px;"></i>
                    <input type="text" 
                           id="bookmark-search"
                           placeholder="Search for marked plants"
                           value="${dbController.search}"
                           style="flex: 1; border: none; background: none; outline: none; color: #2E7D32;">
                </div>
            </div>
        `;
  },

  renderBookmarks: function (bookmarks) {
    return bookmarks
      .map(
        (plant) => `
            <div class="bookmark-item" onclick="BookmarkView.viewPlantDetail(${
              plant.id
            })">
                <div class="bookmark-image">
                    ${
                      plant.image
                        ? `<img src="${plant.image}" 
                              onerror="this.onerror=null; this.src='img/plant-logo.png';">`
                        : `<div class="image-placeholder">
                            <i class="fa fa-image"></i>
                            <p>No image available</p>
                        </div>`
                    }
                </div>
                <div class="bookmark-info">
                    <div class="bookmark-label">Common name</div>
                    <div class="bookmark-name">${plant.common_name || "-"}</div>
                    
                    <div class="bookmark-label">Other name</div>
                    ${
                      plant.other_name && plant.other_name.length > 0
                        ? plant.other_name
                            .map(
                              (name, index) =>
                                `<div class="bookmark-other-name">${
                                  index + 1
                                }. ${name}</div>`
                            )
                            .join("")
                        : '<div class="bookmark-other-name">-</div>'
                    }
                    
                    <div class="bookmark-label">Family</div>
                    <div class="bookmark-family">${plant.family || "-"}</div>
                </div>
                <button class="remove-bookmark-btn" 
                        onclick="event.stopPropagation(); BookmarkView.removeBookmark(${
                          plant.id
                        })">
                    <i class="fa fa-trash"></i> Remove
                </button>
            </div>
        `
      )
      .join("");
  },

  setupEventListeners: function () {
    const searchInput = document.getElementById("bookmark-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        App.controllers.db.search = e.target.value;
        this.render(document.getElementById("main-content"));
      });
    }
  },

  async removeBookmark(plantId) {
    await App.controllers.db.deleteBookmark(plantId);
    this.render(document.getElementById("main-content"));
  },

  viewPlantDetail: function (plantId) {
    App.controllers.plantDetail = new PlantDetailController();
    App.controllers.plantDetail.getPlantDetail(plantId).then(() => {
      PlantDetailView.render(document.getElementById("main-content"));
    });
  },
};

// Add bookmark-specific styles
const bookmarkStyles = `
<style>
.bookmark-container {
    padding: 10px;
}

.bookmarks-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.bookmark-item {
    background: white;
    border-radius: 10px;
    padding: 5px;
    display: flex;
    gap: 10px;
    box-shadow: 0 0 10px rgba(76, 175, 79, 0.3);
    cursor: pointer;
    position: relative;
    min-height: 150px;
}

.bookmark-image {
    width: 180px;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.bookmark-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
}

.image-placeholder i {
    font-size: 40px;
    margin-bottom: 10px;
}

.bookmark-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.bookmark-label {
    color: #666;
    font-size: 14px;
}

.bookmark-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.bookmark-other-name {
    font-size: 14px;
    padding-left: 10px;
}

.bookmark-family {
    font-weight: 600;
    padding-left: 10px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 18px;
}

.remove-bookmark-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.2);
    border: none;
    border-radius: 8px;
    padding: 5px 15px;
    color: #d32f2f;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById("bookmark-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "bookmark-styles";
  styleElement.innerHTML = bookmarkStyles;
  document.head.appendChild(styleElement);
}
