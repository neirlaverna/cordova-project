// storage.service.js - Local Storage Service

const StorageService = {
  // Keys for storage
  keys: {
    USER_DATA: "plantarium_user_data",
    PLANT_CACHE: "plantarium_plant_cache",
    DISEASE_CACHE: "plantarium_disease_cache",
    BOOKMARKS: "plantarium_bookmarks",
    SETTINGS: "plantarium_settings",
  },

  // Set item in storage
  setItem: function (key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },

  // Get item from storage
  getItem: function (key) {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  // Remove item from storage
  removeItem: function (key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  },

  // Clear all storage
  clear: function () {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },

  // User data methods
  saveUserData: function (userData) {
    return this.setItem(this.keys.USER_DATA, userData);
  },

  getUserData: function () {
    return this.getItem(this.keys.USER_DATA);
  },

  clearUserData: function () {
    return this.removeItem(this.keys.USER_DATA);
  },

  // Cache methods
  savePlantCache: function (plants) {
    const cacheData = {
      timestamp: Date.now(),
      data: plants,
    };
    return this.setItem(this.keys.PLANT_CACHE, cacheData);
  },

  getPlantCache: function (maxAge = 3600000) {
    // 1 hour default
    const cache = this.getItem(this.keys.PLANT_CACHE);
    if (!cache) return null;

    const age = Date.now() - cache.timestamp;
    if (age > maxAge) {
      this.removeItem(this.keys.PLANT_CACHE);
      return null;
    }

    return cache.data;
  },

  saveDiseaseCache: function (diseases) {
    const cacheData = {
      timestamp: Date.now(),
      data: diseases,
    };
    return this.setItem(this.keys.DISEASE_CACHE, cacheData);
  },

  getDiseaseCache: function (maxAge = 3600000) {
    // 1 hour default
    const cache = this.getItem(this.keys.DISEASE_CACHE);
    if (!cache) return null;

    const age = Date.now() - cache.timestamp;
    if (age > maxAge) {
      this.removeItem(this.keys.DISEASE_CACHE);
      return null;
    }

    return cache.data;
  },

  // Offline bookmarks
  saveOfflineBookmarks: function (bookmarks) {
    return this.setItem(this.keys.BOOKMARKS, bookmarks);
  },

  getOfflineBookmarks: function () {
    return this.getItem(this.keys.BOOKMARKS) || { plants: [], diseases: [] };
  },

  // Settings
  saveSettings: function (settings) {
    return this.setItem(this.keys.SETTINGS, settings);
  },

  getSettings: function () {
    return (
      this.getItem(this.keys.SETTINGS) || {
        offlineMode: false,
        notifications: true,
        autoSync: true,
      }
    );
  },
};
