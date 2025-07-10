// plantdetail.controller.js - Plant Detail Controller

class PlantDetailController {
  constructor() {
    this.detailMap = {};
    this.plantWidget = [];
    this.isLoading = true;
    this.isError = false;
  }

  // Get plant detail
  async getPlantDetail(id) {
    const mainController = App.controllers.main;

    // Check if already loaded
    const loaded = mainController.loadedDetail.find((d) => d.id === id);
    if (loaded) {
      this.detailMap = loaded;
      this.setPlantWidget();
      this.isLoading = false;
      return;
    }

    try {
      const response = await fetch(
        `https://perenual.com/api/v2/species/details/${id}?key=sk-DtaQ6815b9a82c0d210195`
      );

      if (response.ok) {
        const data = await response.json();

        // Process hardiness location
        const hardinessLoc = data.hardiness_location || {};
        const hardinessImg = hardinessLoc.full_url || "";

        this.detailMap = {
          ...data,
          hardinessImgUrl: hardinessImg,
        };

        this.setPlantWidget();

        // Save to loaded details
        const saveLoad = [...mainController.loadedDetail];
        saveLoad.push(this.detailMap);
        mainController.setLoaded(saveLoad);

        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.isError = true;
      }
    } catch (error) {
      console.error("Error fetching plant detail:", error);
      this.isLoading = false;
      this.isError = true;
    }
  }

  // Set plant widget data
  setPlantWidget() {
    const data = this.detailMap;

    if (Object.keys(data).length === 0) return;

    this.plantWidget = [
      {
        icon: "fa-refresh",
        title: "Cycle",
        subtitle: data.cycle || "-",
      },
      {
        icon: "fa-tint",
        title: "Watering",
        subtitle: data.watering || "-",
      },
      {
        icon: "fa-map",
        title: "Hardiness zone",
        subtitle: this.getHardinessZone(data.hardiness),
      },
      {
        icon: "fa-leaf",
        title: "Flowers",
        subtitle: data.flowers === true ? "Flower" : "Non-flower",
      },
      {
        icon: "fa-sun-o",
        title: "Sun",
        subtitle: Array.isArray(data.sunlight) ? data.sunlight.join(", ") : "-",
      },
      {
        icon: "fa-globe",
        title: "Soil",
        subtitle: Array.isArray(data.soil) ? data.soil.join(", ") : "-",
      },
      {
        icon: "fa-tree",
        title: "Cones",
        subtitle: data.cones === true ? "Yes" : "No",
      },
      {
        icon: "fa-leaf",
        title: "Leaf",
        subtitle: data.leaf === true ? "Yes" : "No",
      },
      {
        icon: "fa-line-chart",
        title: "Growth rate",
        subtitle: data.growth_rate || "-",
      },
      {
        icon: "fa-wrench",
        title: "Maintenance",
        subtitle: data.maintenance || "-",
      },
      {
        icon: "fa-trophy",
        title: "Drought tolerant",
        subtitle: data.drought_tolerant === true ? "Yes" : "No",
      },
      {
        icon: "fa-signal",
        title: "Care level",
        subtitle: data.care_level || "-",
      },
    ];
  }

  // Get hardiness zone string
  getHardinessZone(hardiness) {
    if (!hardiness || !hardiness.min || !hardiness.max) {
      return "-";
    }

    if (hardiness.min === hardiness.max) {
      return hardiness.max.toString();
    }

    return `${hardiness.min} - ${hardiness.max}`;
  }
}
