<script setup>
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const router = useRouter();
const theme = useTheme();
const { locale } = useI18n();

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
</script>

<template>
  <v-app :theme="theme.global.name.value">
    <v-app-bar app color="primary" dark>
      <v-toolbar
        dark
        prominent
        elevation="5"
      >
        <v-toolbar-title>{{ $t('appTitle') }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Language Switcher -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-translate" v-bind="props"></v-btn>
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
        <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
               @click="toggleTheme"></v-btn>

        <v-tabs>
          <!-- Show only if logged in -->
          <v-tab v-if="authStore.isLoggedIn" to="/"> {{ $t('nav.dashboard') }} </v-tab>

          <!-- Show only if logged out -->
          <v-tab v-if="!authStore.isLoggedIn" to="/register"> {{ $t('nav.register') }} </v-tab>
          <v-tab v-if="!authStore.isLoggedIn" to="/login"> {{ $t('nav.login') }} </v-tab>

          <!-- Always show -->
          <v-tab to="/about"> {{ $t('nav.about') }} </v-tab>

          <!-- Show Logout button only if logged in -->
          <v-btn v-if="authStore.isLoggedIn" @click="handleLogout" variant="text"> {{ $t('nav.logout') }} </v-btn>
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
