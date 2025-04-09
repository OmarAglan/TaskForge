<script setup>
/**
 * Imports the AuthenticationService for handling user authentication.
 * Imports ref from Vue for using reactive variables.
*/
import AuthenticationService from '@/services/AuthenticationService';
import { ref } from 'vue';

/**
 * username: Reactive reference to the username input.
 * password: Reactive reference to the password input. 
 * error: Reactive reference to hold any error message.
*/
const username = ref('');
const password = ref('');
const error = ref(null);
const message = ref(null);

/**
 * Registers a new user by calling the AuthenticationService.
 * Handles the response and any errors.
*/
async function register() {
  try {
    const response = await AuthenticationService.register({
      username: username.value,
      password: password.value,
    });
    if (response.status === 200) {
      message.value = 'registerView.successMessage';
    }

    // Handle successful registration (e.g., redirect)
    console.log('Registration successful!', response.data);
    setTimeout(() => {
      message.value = null;
    }, 7000); // hide after 7 seconds
  } catch (err) {
    // Handle error
    error.value = err.response?.data?.error || 'registerView.failMessage';
    /**
    * Sets a timeout to clear the error message after 6 seconds.
    * This avoids the error persisting on screen indefinitely after being handled.
    */
    setTimeout(() => {
      error.value = null;
    }, 7000); // hide after 7 seconds
  }
}
</script>

<template>
  <!-- Register -->
  <div>
    <br>
    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
      <div class="text-subtitle-1 text-medium-emphasis">{{ $t('registerView.usernameLabel') }}</div>

      <v-text-field density="compact" :placeholder="$t('registerView.usernamePlaceholder')" prepend-inner-icon="mdi-account-outline"
        variant="outlined" v-model="username"></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        {{ $t('registerView.passwordLabel') }}
      </div>

      <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
        density="compact" :placeholder="$t('registerView.passwordPlaceholder')" prepend-inner-icon="mdi-lock-outline" variant="outlined"
        @click:append-inner="visible = !visible" v-model="password"></v-text-field>

      <v-card class="mb-12" color="surface-variant" variant="tonal">
        <v-alert v-if="message" text="" :title="$t('registerView.successTitle')" type="success">
          <p>{{ $t(message) }}</p>
        </v-alert>

        <v-alert v-if="error" text='' :title="$t('registerView.failTitle')" type="error">
          <p>{{ error.includes('.') ? $t(error) : error }}</p>
        </v-alert>

      </v-card>

      <v-btn class="mb-8" color="blue" size="large" variant="tonal" block @click="register()">
        {{ $t('registerView.submitButton') }}
      </v-btn>

      <v-card-text class="text-center">
        <v-btn href="/login" >
        <a class="text-blue text-decoration-none" rel="noopener noreferrer">
          {{ $t('registerView.loginPrompt') }} <v-icon icon="mdi-chevron-right"></v-icon>
        </a>
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

}

.register-form {
  border: 1.5px solid #ddd;
  padding: 30px;
  border-radius: 5px;
  display: flex;

  flex-direction: column;

}

.form-group {
  margin-bottom: 15px;
  display: flex;

  align-items: center;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  flex: 0 0 30%;

}

button {
  background-color: #4CAF50;

  border: springgreen;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-top: 10px;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;
}


@media (max-width: 768px) {
  .register-form {
    width: 80%;

  }

  .form-group label {
    flex: 0 0 25%;

  }
}
</style>