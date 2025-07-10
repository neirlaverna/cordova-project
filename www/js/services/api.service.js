// api.service.js - API Service for Perenual

const ApiService = {
  baseUrl: "https://perenual.com/api",
  apiKey: "sk-DtaQ6815b9a82c0d210195",

  // Build URL with API key
  buildUrl: function (endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append("key", this.apiKey);

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return url.toString();
  },

  // Fetch with error handling
  fetchData: async function (url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("API fetch error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get plant list
  getPlantList: async function (page = 1) {
    const url = this.buildUrl("/v2/species-list", { page });
    return await this.fetchData(url);
  },

  // Get plant details
  getPlantDetails: async function (id) {
    const url = this.buildUrl(`/v2/species/details/${id}`);
    return await this.fetchData(url);
  },

  // Search plants
  searchPlants: async function (query) {
    const url = this.buildUrl("/v2/species-list", { q: query });
    return await this.fetchData(url);
  },

  // Get disease list
  getDiseaseList: async function (page = 1) {
    const url = this.buildUrl("/pest-disease-list", { page });
    return await this.fetchData(url);
  },
};
