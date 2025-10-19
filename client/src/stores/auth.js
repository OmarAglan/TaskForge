import { ref } from 'vue'
import { defineStore } from 'pinia'

// Define the authentication store
export const useAuthStore = defineStore('auth', () => {
  // State: Track if the user is logged in. Default to false.
  // Initialize from localStorage if available
  const isLoggedIn = ref(!!localStorage.getItem('auth_token'))
  const user = ref(null) // Placeholder for user info
  const token = ref(localStorage.getItem('auth_token') || null)

  // Initialize user data from localStorage if available
  if (localStorage.getItem('user_data')) {
    try {
      user.value = JSON.parse(localStorage.getItem('user_data'))
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e)
      localStorage.removeItem('user_data')
    }
  }

  // Actions: Functions to modify the state
  function setLoggedIn(status, userData = null, authToken = null) {
    isLoggedIn.value = status
    user.value = userData
    token.value = authToken
    
    // Persist login status to localStorage
    if (status && authToken) {
      localStorage.setItem('auth_token', authToken)
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData))
      }
    }
  }

  function login(userData, authToken) {
    setLoggedIn(true, userData, authToken)
  }

  function logout() {
    setLoggedIn(false, null, null)
    // Clear persisted login status
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  // Return state and actions
  return { isLoggedIn, user, token, login, logout }
})