<script setup>
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';

const authStore = useAuthStore();
const router = useRouter();
const theme = useTheme();

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' }); // Redirect to login after logout
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}
</script>

<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="primary" dark>
      <v-toolbar
        dark
        prominent
        elevation="5"
      >
        <v-toolbar-title>Tasky</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Theme Toggle Button -->
        <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
               @click="toggleTheme"></v-btn>

        <v-tabs>
          <!-- Show only if logged in -->
          <v-tab v-if="authStore.isLoggedIn" to="/"> Dashboard </v-tab>

          <!-- Show only if logged out -->
          <v-tab v-if="!authStore.isLoggedIn" to="/register"> Register </v-tab>
          <v-tab v-if="!authStore.isLoggedIn" to="/login"> Login </v-tab>

          <!-- Always show -->
          <v-tab to="/about"> About </v-tab>

          <!-- Show Logout button only if logged in -->
          <v-btn v-if="authStore.isLoggedIn" @click="handleLogout" variant="text"> Logout </v-btn>
        </v-tabs>
      </v-toolbar>

    </v-app-bar>
    <v-main>
      <v-container class="mt-5">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
/* Global styles - apply Inter font */
html, body, #app, .v-application {
  font-family: 'Inter', sans-serif !important;
}

/* Remove the scoped attribute to make these global */
/* Remove the specific body background-color */
body {
  margin: 0;
  padding: 0;
}
</style>
