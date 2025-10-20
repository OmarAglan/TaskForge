<script setup>
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  showDialog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const projectStore = useProjectStore()
const { t } = useI18n()

// Form data
const form = ref({
  name: '',
  description: '',
  color: '#3498db'
})

// Predefined color palette
const colorPalette = [
  '#3498db', // Blue
  '#e74c3c', // Red
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#34495e', // Dark Gray
  '#e67e22', // Carrot
  '#16a085', // Green Sea
  '#c0392b', // Pomegranate
  '#8e44ad', // Wisteria
  '#2c3e50', // Midnight Blue
  '#f1c40f', // Yellow
  '#27ae60', // Nephritis
  '#d35400', // Pumpkin
  '#7f8c8d'  // Asbestos
]

// Loading state
const loading = ref(false)

// Form validation rules
const rules = computed(() => ({
  name: { required, maxLength: maxLength(255) },
  description: { maxLength: maxLength(1000) }
}))

const v$ = useVuelidate(rules, form)

// Computed properties
const isEdit = computed(() => !!props.project)
const dialogTitle = computed(() => isEdit.value ? t('projects.editProject') : t('projects.createNew'))

// Watch for project prop changes
watch(() => props.project, (newProject) => {
  if (newProject) {
    form.value = {
      name: newProject.name || '',
      description: newProject.description || '',
      color: newProject.color || '#3498db'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Methods
function resetForm() {
  form.value = {
    name: '',
    description: '',
    color: '#3498db'
  }
  v$.value.$reset()
}

function selectColor(color) {
  form.value.color = color
}

async function saveProject() {
  // Validate form
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return
  
  loading.value = true
  
  try {
    let savedProject
    
    if (isEdit.value) {
      // Update existing project
      savedProject = await projectStore.updateProject(props.project.id, form.value)
    } else {
      // Create new project
      savedProject = await projectStore.createProject(form.value)
    }
    
    if (savedProject) {
      emit('saved', savedProject)
      emit('close')
      resetForm()
    }
  } finally {
    loading.value = false
  }
}

function closeDialog() {
  emit('close')
  resetForm()
}
</script>

<template>
  <v-dialog
    :model-value="showDialog"
    @update:model-value="closeDialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        {{ dialogTitle }}
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form @submit.prevent="saveProject">
          <!-- Name field -->
          <v-text-field
            v-model="form.name"
            :label="$t('projects.name')"
            variant="outlined"
            :error-messages="v$.name.$errors.map(e => e.$message)"
            @blur="v$.name.$touch"
            required
            class="mb-4"
            prepend-inner-icon="mdi-folder"
          ></v-text-field>
          
          <!-- Description field -->
          <v-textarea
            v-model="form.description"
            :label="$t('projects.description')"
            variant="outlined"
            rows="3"
            :error-messages="v$.description.$errors.map(e => e.$message)"
            @blur="v$.description.$touch"
            class="mb-4"
            prepend-inner-icon="mdi-text"
          ></v-textarea>
          
          <!-- Color picker -->
          <div class="mb-4">
            <label class="text-subtitle-2 mb-2 d-block">
              {{ $t('projects.color') }}
            </label>
            
            <!-- Selected color preview -->
            <div class="d-flex align-center mb-3">
              <v-sheet
                :color="form.color"
                width="60"
                height="60"
                rounded="lg"
                elevation="2"
                class="mr-3"
              ></v-sheet>
              <v-text-field
                v-model="form.color"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-palette"
                placeholder="#3498db"
              ></v-text-field>
            </div>
            
            <!-- Color palette -->
            <div class="color-palette">
              <v-btn
                v-for="color in colorPalette"
                :key="color"
                :color="color"
                class="color-option"
                :class="{ 'selected': form.color === color }"
                size="small"
                icon
                @click="selectColor(color)"
              >
                <v-icon v-if="form.color === color" color="white">mdi-check</v-icon>
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveProject"
          :loading="loading"
        >
          {{ isEdit ? $t('common.update') : $t('common.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: transform 0.2s ease-in-out;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border: 3px solid currentColor;
  transform: scale(1.15);
}
</style>