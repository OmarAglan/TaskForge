<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { computed, watch, onMounted, ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const theme = useTheme();
const { locale, t } = useI18n();
const drawer = ref(false);

// Computed property for dynamic font family
const fontFamily = computed(() => {
  return locale.value === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif';
});

// Computed property for text direction
const direction = computed(() => {
  return locale.value === 'ar' ? 'rtl' : 'ltr';
});

// Function to update HTML lang attribute
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale;
});

// Set initial lang attribute
onMounted(() => {
  document.documentElement.lang = locale.value;
});

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' }); // Redirect to login after logout
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}

function switchLanguage(lang) {
  locale.value = lang;
  // Persist language preference
  localStorage.setItem('user-locale', lang);
}

// Function to check if a route is active
const isRouteActive = (routeName) => {
  return route.name === routeName;
};
</script>

<template>
  <v-app
    :theme="theme.global.name.value"
    :dir="direction"
    :style="{ fontFamily: fontFamily }"
  >
    <v-app-bar app flat density="compact" scroll-behavior="elevate">

      <!-- Logo/Title (Left) -->
      <v-toolbar-title class="d-flex align-center mr-4">
        <v-icon start icon="mdi-check-all"></v-icon>
        <span>{{ $t('appTitle') }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer> <!-- Pushes nav to center -->

      <!-- Central Navigation Links -->
      <div class="d-none d-md-flex justify-center"> <!-- Hide on smaller screens -->
          <!-- Use :class to make active link bold -->
          <v-btn variant="text" :class="{ 'font-weight-bold': isRouteActive('home') }" v-if="authStore.isLoggedIn" to="/">{{ $t('nav.dashboard') }}</v-btn>
          <v-btn variant="text" :class="{ 'font-weight-bold': isRouteActive('about') }" to="/about">{{ $t('nav.about') }}</v-btn>
          <!-- Placeholders based on Figma -->
          <v-btn variant="text" disabled>How it Works</v-btn>
          <v-btn variant="text" disabled>Services</v-btn>
      </div>

      <v-spacer></v-spacer> <!-- Pushes actions/auth to right -->

      <!-- Auth Buttons & Action Icons (Right) -->
      <template v-if="!authStore.isLoggedIn">
        <v-btn variant="text" to="/login" class="mx-1">{{ $t('nav.login') }}</v-btn> <!-- "Sign In" -->
        <v-btn variant="elevated" color="primary" to="/register" class="ml-1">{{ $t('nav.register') }}</v-btn> <!-- "Sign Up" -->
      </template>

      <!-- Language Switcher -->
      <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn density="comfortable" icon="mdi-translate" v-bind="props" class="ml-2"></v-btn>
          </template>
          <v-list>
            <v-list-item @click="switchLanguage('en')">
              <v-list-item-title>English</v-list-item-title>
            </v-list-item>
            <v-list-item @click="switchLanguage('ar')">
              <v-list-item-title>العربية</v-list-item-title>
            </v-list-item>
          </v-list>
      </v-menu>

      <!-- Theme Toggle Button -->
      <v-btn density="comfortable" :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
             @click="toggleTheme" class="ml-1"></v-btn>

      <!-- Logout Button -->
      <v-btn v-if="authStore.isLoggedIn" density="comfortable" icon="mdi-logout" @click="handleLogout" class="ml-1"></v-btn>

      <!-- Hamburger Menu for Mobile -->
      <v-app-bar-nav-icon class="d-md-none" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    </v-app-bar>

    <!-- Navigation Drawer for Mobile -->
    <v-navigation-drawer v-model="drawer" temporary location="right" class="d-md-none">
       <v-list density="compact" nav>
          <v-list-item v-if="authStore.isLoggedIn" prepend-icon="mdi-view-dashboard" :title="t('nav.dashboard')" value="home" to="/"></v-list-item>
          <v-list-item prepend-icon="mdi-information-outline" :title="t('nav.about')" value="about" to="/about"></v-list-item>
          <!-- Add other links here -->
       </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="pt-12 mt-5">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
/* Remove potential height issues with default v-toolbar within v-app-bar if needed */
.v-toolbar__content {
  height: auto !important; /* Adjust if necessary */
}

/* Global styles - remove specific font-family */
html, body, #app, .v-application {
  /* font-family is now applied dynamically via :style on v-app */
}

/* Basic RTL adjustments for the app bar tabs/buttons if needed */
.v-application--is-rtl .v-tabs {
  /* Potentially adjust order or spacing for RTL */
}

body {
  margin: 0;
  padding: 0;
}

/* Style for bold active nav link */
.font-weight-bold {
  font-weight: 700 !important; /* Match Figma bold */
}
</style>
