// supabase.service.js - Supabase Service

const SupabaseService = {
  client: null,

  // Initialize Supabase client
  initialize: function () {
    const supabaseUrl = "https://xjqyqmaxrjcdvihvmhho.supabase.co";
    const supabaseAnonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcXlxbWF4cmpjZHZpaHZtaGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTgxNjcsImV4cCI6MjA2MTc3NDE2N30.OWEo3mZQWLDxUU_CzBokP013Ll9o1mxoyvDtqKcwRzg";

    this.client = supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    // Setup auth state listener
    this.client.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN") {
        App.currentUser = session.user;
        App.controllers.auth.setUserData();
        if (document.getElementById("auth-wrapper").style.display === "block") {
          App.showMainApp();
        }
      } else if (event === "SIGNED_OUT") {
        App.currentUser = null;
        App.showAuthScreen();
      }
    });
  },

  // Sign in with email and password
  signIn: async function (email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign up with email and password
  signUp: async function (email, password, username) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      // Sign out after registration
      if (data.user) {
        await this.client.auth.signOut();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async function () {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: function () {
    return this.client.auth.getUser();
  },

  // Get current session
  getCurrentSession: function () {
    return this.client.auth.getSession();
  },

  // Update user
  updateUser: async function (attributes) {
    try {
      const { data, error } = await this.client.auth.updateUser(attributes);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Database operations

  // Add bookmark
  addBookmark: async function (table, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data);

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete bookmark
  deleteBookmark: async function (table, id, usermark) {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq("usermark", usermark)
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Fetch bookmarks
  fetchBookmarks: async function (table, usermark) {
    try {
      const { data, error } = await this.client
        .from(table)
        .select()
        .eq("usermark", usermark);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Setup realtime subscription
  subscribeToChanges: function (table, usermark, callback) {
    const channel = this.client
      .channel("public:" + table)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: `usermark=eq.${usermark}`,
        },
        callback
      )
      .subscribe();

    return channel;
  },
};
