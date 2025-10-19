<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  task: {
    type: Object,
    default: null
  },
  showDialog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const { t } = useI18n()

// Form data
const form = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  projectId: null
})

// Loading state
const loading = ref(false)

// Form validation rules
const rules = computed(() => ({
  title: { required, maxLength: maxLength(255) },
  description: { maxLength: maxLength(5000) }
}))

const v$ = useVuelidate(rules, form)

// Computed properties
const isEdit = computed(() => !!props.task)
const dialogTitle = computed(() => isEdit.value ? t('tasks.editTask') : t('tasks.createNew'))

// Status options
const statusOptions = computed(() => [
  { title: t('tasks.status.todo'), value: 'todo' },
  { title: t('tasks.status.in_progress'), value: 'in_progress' },
  { title: t('tasks.status.completed'), value: 'completed' },
  { title: t('tasks.status.blocked'), value: 'blocked' }
])

// Priority options
const priorityOptions = computed(() => [
  { title: t('tasks.priority.low'), value: 'low' },
  { title: t('tasks.priority.medium'), value: 'medium' },
  { title: t('tasks.priority.high'), value: 'high' },
  { title: t('tasks.priority.urgent'), value: 'urgent' }
])

// Project options
const projectOptions = computed(() => {
  const options = [{ title: t('tasks.noProject'), value: null }]
  projectStore.projects.forEach(project => {
    options.push({
      title: project.name,
      value: project.id
    })
  })
  return options
})

// Watch for task prop changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || '',
      projectId: newTask.projectId || null
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for dialog open/close
watch(() => props.showDialog, (isOpen) => {
  if (isOpen) {
    // Fetch projects if not already loaded
    if (projectStore.projects.length === 0) {
      projectStore.fetchProjects()
    }
  }
})

// Methods
function resetForm() {
  form.value = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    projectId: null
  }
  v$.value.$reset()
}

async function saveTask() {
  // Validate form
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return
  
  loading.value = true
  
  try {
    let savedTask
    
    if (isEdit.value) {
      // Update existing task
      savedTask = await taskStore.updateTask(props.task.id, form.value)
    } else {
      // Create new task
      savedTask = await taskStore.createTask(form.value)
    }
    
    if (savedTask) {
      emit('saved', savedTask)
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

onMounted(() => {
  // Fetch projects if not already loaded
  if (projectStore.projects.length === 0) {
    projectStore.fetchProjects()
  }
})
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
        <v-form @submit.prevent="saveTask">
          <!-- Title field -->
          <v-text-field
            v-model="form.title"
            :label="$t('tasks.title')"
            variant="outlined"
            :error-messages="v$.title.$errors.map(e => e.$message)"
            @blur="v$.title.$touch"
            required
            class="mb-4"
          ></v-text-field>
          
          <!-- Description field -->
          <v-textarea
            v-model="form.description"
            :label="$t('tasks.description')"
            variant="outlined"
            rows="3"
            :error-messages="v$.description.$errors.map(e => e.$message)"
            @blur="v$.description.$touch"
            class="mb-4"
          ></v-textarea>
          
          <v-row>
            <!-- Status field -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                :label="$t('tasks.status.label')"
                variant="outlined"
                class="mb-4"
              ></v-select>
            </v-col>
            
            <!-- Priority field -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.priority"
                :items="priorityOptions"
                :label="$t('tasks.priority.label')"
                variant="outlined"
                class="mb-4"
              ></v-select>
            </v-col>
          </v-row>
          
          <v-row>
            <!-- Due date field -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.dueDate"
                :label="$t('tasks.dueDate')"
                type="date"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
            </v-col>
            
            <!-- Project field -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.projectId"
                :items="projectOptions"
                :label="$t('tasks.project')"
                variant="outlined"
                :loading="projectStore.loading"
                class="mb-4"
              ></v-select>
            </v-col>
          </v-row>
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
          @click="saveTask"
          :loading="loading"
        >
          {{ isEdit ? $t('common.update') : $t('common.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-dialog {
  overflow-y: auto;
}
</style>