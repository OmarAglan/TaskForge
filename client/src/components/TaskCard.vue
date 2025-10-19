<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  showProject: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'delete', 'statusChange'])

const taskStore = useTaskStore()
const { t } = useI18n()

const statusLoading = ref(false)
const showDeleteDialog = ref(false)

// Computed properties for styling
const statusColor = computed(() => {
  switch (props.task.status) {
    case 'todo': return 'grey'
    case 'in_progress': return 'blue'
    case 'completed': return 'green'
    case 'blocked': return 'red'
    default: return 'grey'
  }
})

const priorityColor = computed(() => {
  switch (props.task.priority) {
    case 'low': return 'grey'
    case 'medium': return 'orange'
    case 'high': return 'deep-orange'
    case 'urgent': return 'red'
    default: return 'grey'
  }
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'completed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(props.task.dueDate)
  return dueDate < today
})

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return ''
  const date = new Date(props.task.dueDate)
  return date.toLocaleDateString()
})

// Status options for dropdown
const statusOptions = computed(() => [
  { title: t('tasks.status.todo'), value: 'todo' },
  { title: t('tasks.status.in_progress'), value: 'in_progress' },
  { title: t('tasks.status.completed'), value: 'completed' },
  { title: t('tasks.status.blocked'), value: 'blocked' }
])

// Priority labels
const priorityLabel = computed(() => {
  return t(`tasks.priority.${props.task.priority}`)
})

// Methods
async function changeStatus(newStatus) {
  if (newStatus === props.task.status) return
  
  statusLoading.value = true
  try {
    const updatedTask = await taskStore.updateTaskStatus(props.task.id, newStatus)
    if (updatedTask) {
      emit('statusChange', updatedTask)
    }
  } finally {
    statusLoading.value = false
  }
}

function editTask() {
  emit('edit', props.task)
}

function deleteTask() {
  showDeleteDialog.value = true
}

async function confirmDelete() {
  showDeleteDialog.value = false
  const success = await taskStore.deleteTask(props.task.id)
  if (success) {
    emit('delete', props.task.id)
  }
}
</script>

<template>
  <v-card
    class="task-card mb-4"
    :class="{ 'task-completed': task.status === 'completed' }"
    elevation="2"
  >
    <v-card-title class="d-flex align-center pa-3">
      <v-icon
        :color="statusColor"
        class="mr-2"
        icon="mdi-checkbox-blank-circle"
        size="small"
      ></v-icon>
      <span class="text-h6">{{ task.title }}</span>
      <v-spacer></v-spacer>
      
      <!-- Priority indicator -->
      <v-chip
        :color="priorityColor"
        variant="outlined"
        size="small"
        class="mr-2"
      >
        {{ priorityLabel }}
      </v-chip>
      
      <!-- Actions menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item @click="editTask">
            <template v-slot:prepend>
              <v-icon icon="mdi-pencil"></v-icon>
            </template>
            <v-list-item-title>{{ $t('common.edit') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteTask">
            <template v-slot:prepend>
              <v-icon icon="mdi-delete" color="error"></v-icon>
            </template>
            <v-list-item-title>{{ $t('common.delete') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    
    <v-card-text class="pa-3 pt-0">
      <!-- Description -->
      <p v-if="task.description" class="text-body-2 mb-2">
        {{ task.description }}
      </p>
      
      <!-- Project info -->
      <div v-if="showProject && task.project" class="d-flex align-center mb-2">
        <v-icon
          :color="task.project.color"
          icon="mdi-folder"
          size="small"
          class="mr-1"
        ></v-icon>
        <span class="text-body-2">{{ task.project.name }}</span>
      </div>
      
      <!-- Due date -->
      <div v-if="task.dueDate" class="d-flex align-center">
        <v-icon
          :color="isOverdue ? 'error' : 'grey'"
          icon="mdi-calendar"
          size="small"
          class="mr-1"
        ></v-icon>
        <span
          class="text-body-2"
          :class="{ 'text-error': isOverdue }"
        >
          {{ formattedDueDate }}
          <span v-if="isOverdue" class="ml-1">({{ $t('tasks.overdue') }})</span>
        </span>
      </div>
    </v-card-text>
    
    <v-card-actions class="pa-3 pt-0">
      <!-- Status dropdown -->
      <v-select
        :model-value="task.status"
        :items="statusOptions"
        :label="$t('tasks.status.label')"
        variant="outlined"
        density="compact"
        hide-details
        :loading="statusLoading"
        @update:model-value="changeStatus"
        class="status-select"
      ></v-select>
    </v-card-actions>
  </v-card>
  
  <!-- Delete confirmation dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h5">
        {{ $t('tasks.deleteConfirm') }}
      </v-card-title>
      <v-card-text>
        {{ $t('tasks.deleteConfirmMessage', { title: task.title }) }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">
          {{ $t('common.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.task-card {
  transition: transform 0.2s ease-in-out;
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-completed {
  opacity: 0.8;
}

.task-completed .text-h6 {
  text-decoration: line-through;
}

.status-select {
  max-width: 200px;
}
</style>