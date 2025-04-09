import { ref } from 'vue'
import { defineStore } from 'pinia'

// Define the authentication store
export const useAuthStore = defineStore('auth', () => {
  // State: Track if the user is logged in. Default to false.
  // In a real app, you might initialize this from localStorage/sessionStorage
  const isLoggedIn = ref(false)
  const user = ref(null) // Placeholder for user info

  // Actions: Functions to modify the state
  function setLoggedIn(status, userData = null) {
    isLoggedIn.value = status
    user.value = userData
    // TODO: Persist login status (e.g., localStorage)
  }

  function login(userData) {
    // In a real login flow, you'd get user data from API response
    setLoggedIn(true, userData)
  }

  function logout() {
    setLoggedIn(false, null)
    // TODO: Clear persisted login status
  }

  // Return state and actions
  return { isLoggedIn, user, login, logout }
}) 