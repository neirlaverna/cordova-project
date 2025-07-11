// main.controller.js - Main Controller

class MainController {
  constructor() {
    this.plantPageAsFetch = [0];
    this.allPlantData = [];
    this.diseasePageAsFetch = [0];
    this.allDiseaseList = [];
    this.isLoading = false;
    this.familyList = [];
    this.diseaseFamily = [];
    this.searchActive = false;
    this.searchValue = "";
    this.loadedDetail = [];
  }

  // Initialize controller
  async initialize() {
    this.isLoading = true;
    await Promise.all([this.fetchPlantList(1), this.fetchPlantDisease(1)]);
    this.isLoading = false;
  }

  // Set loaded details
  setLoaded(data) {
    this.loadedDetail = data;
  }

  // Set selected family
  setSelectFams(value) {
    this.searchActive = false;
    this.familyList = this.familyList.map((fams) => ({
      ...fams,
      selected: fams.familyName === value,
    }));
  }

  // Set selected disease family
  setSelectDiseaseFams(value) {
    this.searchActive = false;
    this.diseaseFamily = this.diseaseFamily.map((fams) => ({
      ...fams,
      selected: fams.familyName === value,
    }));
  }

  // Fetch plant list
  async fetchPlantList(page) {
    try {
      const response = await fetch(
        `https://perenual.com/api/v2/species-list?key=sk-DtaQ6815b9a82c0d210195&page=${page}`
      );

      if (response.ok) {
        const data = await response.json();
        const allPlant = [...this.allPlantData];
        const famsList = [...this.familyList];

        data.data.forEach((plant) => {
          // Add family
          if (
            plant.family &&
            !famsList.some((f) => f.familyName === plant.family)
          ) {
            famsList.push({
              familyName: plant.family,
              selected: false,
            });
          }

          // Add plant
          if (!allPlant.some((p) => p.id === plant.id)) {
            allPlant.push(plant);
          }
        });

        // Add 'All' option
        if (!famsList.some((f) => f.familyName === "All")) {
          famsList.unshift({ familyName: "All", selected: true });
        }

        this.familyList = famsList;
        this.allPlantData = allPlant;

        // Update pages fetched
        const currentPage = data.current_page || page;
        if (!this.plantPageAsFetch.includes(currentPage)) {
          this.plantPageAsFetch.push(currentPage);
        }
      }
    } catch (error) {
      console.error("Error fetching plant list:", error);
    }
  }

  // Fetch plant disease list
  async fetchPlantDisease(page) {
    try {
      const response = await fetch(
        `https://perenual.com/api/pest-disease-list?key=sk-DtaQ6815b9a82c0d210195&page=${page}`
      );

      if (response.ok) {
        const data = await response.json();
        const allDisease = [...this.allDiseaseList];
        const diseaseFam = [...this.diseaseFamily];

        data.data.forEach((disease) => {
          // Add family
          if (
            disease.family &&
            !diseaseFam.some((f) => f.familyName === disease.family)
          ) {
            diseaseFam.push({
              familyName: disease.family,
              selected: false,
            });
          }

          // Add disease
          if (!allDisease.some((d) => d.id === disease.id)) {
            allDisease.push(disease);
          }
        });

        // Add 'All' option
        if (!diseaseFam.some((f) => f.familyName === "All")) {
          diseaseFam.unshift({ familyName: "All", selected: true });
        }

        this.diseaseFamily = diseaseFam;
        this.allDiseaseList = allDisease;

        // Update pages fetched
        const currentPage = data.current_page || page;
        if (!this.diseasePageAsFetch.includes(currentPage)) {
          this.diseasePageAsFetch.push(currentPage);
        }
      }
    } catch (error) {
      console.error("Error fetching disease list:", error);
    }
  }

  // Pagination handler for plants
  async onFetchDataPagination() {
    const pages = [...this.plantPageAsFetch].sort((a, b) => a - b);
    let nextPage = pages.length;

    for (let i = 0; i < pages.length; i++) {
      if (pages[i] !== i) {
        nextPage = i;
        break;
      }
    }

    await this.fetchPlantList(nextPage);
  }

  // Pagination handler for diseases
  async onFetchDiseaseDataPagination() {
    const pages = [...this.diseasePageAsFetch].sort((a, b) => a - b);
    let nextPage = pages.length;

    for (let i = 0; i < pages.length; i++) {
      if (pages[i] !== i) {
        nextPage = i;
        break;
      }
    }

    await this.fetchPlantDisease(nextPage);
  }

  // Get image from image array
  getImage(imageArray) {
    let image = "";

    try {
      for (let imageMap of imageArray) {
        const imageOptions = [
          imageMap.original_url,
          imageMap.regular_url,
          imageMap.medium_url,
          imageMap.small_url,
          imageMap.thumbnail,
        ];

        for (let url of imageOptions) {
          if (url) {
            image = url;
            break;
          }
        }

        if (image) break;
      }
    } catch (error) {
      console.error("Error getting image:", error);
    }

    return image;
  }

  // Filter plants
  getFilteredPlants() {
    let filtered = this.allPlantData;

    // Apply search filter
    if (this.searchValue) {
      filtered = filtered.filter((plant) => {
        const commonName = (plant.common_name || "").toLowerCase();
        const scientificName = (plant.scientific_name || [])
          .toString()
          .toLowerCase();
        const otherName = (plant.other_name || []).toString().toLowerCase();
        const search = this.searchValue.toLowerCase();

        return (
          commonName.includes(search) ||
          scientificName.includes(search) ||
          otherName.includes(search)
        );
      });
    }

    // Apply family filter
    const selectedFamily = this.familyList.find((f) => f.selected);
    if (selectedFamily && selectedFamily.familyName !== "All") {
      filtered = filtered.filter(
        (plant) => plant.family === selectedFamily.familyName
      );
    }

    return filtered;
  }

  // Filter diseases
  getFilteredDiseases() {
    let filtered = this.allDiseaseList;

    // Apply search filter
    if (this.searchValue) {
      filtered = filtered.filter((disease) => {
        const commonName = (disease.common_name || "").toLowerCase();
        const scientificName = (disease.scientific_name || "").toLowerCase();
        const otherName = (disease.other_name || []).toString().toLowerCase();
        const search = this.searchValue.toLowerCase();

        return (
          commonName.includes(search) ||
          scientificName.includes(search) ||
          otherName.includes(search)
        );
      });
    }

    // Apply family filter
    const selectedFamily = this.diseaseFamily.find((f) => f.selected);
    if (selectedFamily && selectedFamily.familyName !== "All") {
      filtered = filtered.filter(
        (disease) => disease.family === selectedFamily.familyName
      );
    }

    return filtered;
  }
}
