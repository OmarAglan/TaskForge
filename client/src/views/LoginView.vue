<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength } from '@vuelidate/validators'
import AuthenticationService from '@/services/AuthenticationService'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// Form data
const form = ref({
  username: '',
  password: '',
  showPassword: false
})

// Loading and error states
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form validation rules
const rules = {
  username: { required, minLength: minLength(3) },
  password: { required, minLength: minLength(6) }
}

const v$ = useVuelidate(rules, form)

// Toggle password visibility
function togglePasswordVisibility() {
  form.value.showPassword = !form.value.showPassword
}

// Handle form submission
async function handleLogin() {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validate form
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return
  
  loading.value = true
  
  try {
    const response = await AuthenticationService.login({
      username: form.value.username,
      password: form.value.password
    })
    
    if (response.data.success) {
      // Store token and user data
      authStore.login(response.data.data.user, response.data.data.token)
      
      // Show success message
      successMessage.value = t('loginView.successMessage')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMessage.value = response.data.error || t('loginView.errorInvalidCredentials')
    }
  } catch (error) {
    console.error('Login error:', error)
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.error || t('loginView.errorServerError')
    } else {
      errorMessage.value = t('loginView.errorServerError')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8 pa-6">
          <v-card-title class="text-center mb-6">
            <h1 class="text-h4">{{ $t('loginView.title') }}</h1>
          </v-card-title>
          
          <!-- Success Message -->
          <v-alert v-if="successMessage" type="success" class="mb-4" dismissible>
            {{ successMessage }}
          </v-alert>
          
          <!-- Error Message -->
          <v-alert v-if="errorMessage" type="error" class="mb-4" dismissible>
            {{ errorMessage }}
          </v-alert>
          
          <v-form @submit.prevent="handleLogin">
            <!-- Username Field -->
            <v-text-field
              v-model="form.username"
              :label="$t('loginView.usernameLabel')"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              class="mb-4"
              :error-messages="v$.username.$errors.map(e => e.$message)"
              @blur="v$.username.$touch"
              required
            />
            
            <!-- Password Field -->
            <v-text-field
              v-model="form.password"
              :label="$t('loginView.passwordLabel')"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="form.showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="form.showPassword ? 'text' : 'password'"
              variant="outlined"
              class="mb-4"
              :error-messages="v$.password.$errors.map(e => e.$message)"
              @blur="v$.password.$touch"
              @click:append-inner="togglePasswordVisibility"
              required
            />
            
            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              class="mb-4"
            >
              {{ $t('loginView.submitButton') }}
            </v-btn>
            
            <!-- Register Link -->
            <div class="text-center">
              <span>{{ $t('loginView.registerPrompt') }}</span>
              <v-btn variant="text" color="primary" to="/register" class="ml-1">
                {{ $t('loginView.registerLink') }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>