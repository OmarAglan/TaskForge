<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import { useI18n } from 'vue-i18n'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const { t } = useI18n()

// State
const loading = ref(true)
const showTaskForm = ref(false)
const editingTask = ref(null)

// Computed properties
const totalTasks = computed(() => taskStore.tasks.length)
const completedTasks = computed(() => taskStore.tasksByStatus.completed.length)
const pendingTasks = computed(() => taskStore.tasksByStatus.todo.length + taskStore.tasksByStatus.in_progress.length)
const overdueTasks = computed(() => taskStore.overdueTasks.length)

// Get the 5 most recent tasks
const recentTasks = computed(() => {
  return [...taskStore.tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Get tasks by status for chart
const tasksByStatusData = computed(() => {
  return [
    { label: t('tasks.status.todo'), value: taskStore.tasksByStatus.todo.length, color: 'grey' },
    { label: t('tasks.status.in_progress'), value: taskStore.tasksByStatus.in_progress.length, color: 'blue' },
    { label: t('tasks.status.completed'), value: taskStore.tasksByStatus.completed.length, color: 'green' },
    { label: t('tasks.status.blocked'), value: taskStore.tasksByStatus.blocked.length, color: 'red' }
  ]
})

// Get tasks by priority for chart
const tasksByPriorityData = computed(() => {
  return [
    { label: t('tasks.priority.low'), value: taskStore.tasksByPriority.low.length, color: 'grey' },
    { label: t('tasks.priority.medium'), value: taskStore.tasksByPriority.medium.length, color: 'orange' },
    { label: t('tasks.priority.high'), value: taskStore.tasksByPriority.high.length, color: 'deep-orange' },
    { label: t('tasks.priority.urgent'), value: taskStore.tasksByPriority.urgent.length, color: 'red' }
  ]
})

// Calculate completion percentage
const completionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

// Methods
async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      projectStore.fetchProjects()
    ])
  } finally {
    loading.value = false
  }
}

function openTaskForm(task = null) {
  editingTask.value = task
  showTaskForm.value = true
}

function closeTaskForm() {
  showTaskForm.value = false
  editingTask.value = null
}

function onTaskSaved() {
  // Task is already updated in the store
  closeTaskForm()
}

function onTaskDeleted() {
  // Task is already removed from the store
}

function onTaskStatusChanged() {
  // Task is already updated in the store
}

// Load data on component mount
onMounted(() => {
  loadData()
})
</script>

<template>
  <v-container>
    <!-- Page Title -->
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4">{{ $t('nav.dashboard') }}</h1>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openTaskForm"
      >
        {{ $t('tasks.createNew') }}
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="h-100">
            <v-card-text class="text-center">
              <div class="text-h4 text-primary">{{ totalTasks }}</div>
              <div class="text-subtitle-1">{{ $t('dashboard.totalTasks') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="h-100">
            <v-card-text class="text-center">
              <div class="text-h4 text-success">{{ completedTasks }}</div>
              <div class="text-subtitle-1">{{ $t('dashboard.completedTasks') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="h-100">
            <v-card-text class="text-center">
              <div class="text-h4 text-warning">{{ pendingTasks }}</div>
              <div class="text-subtitle-1">{{ $t('dashboard.pendingTasks') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="h-100">
            <v-card-text class="text-center">
              <div class="text-h4 text-error">{{ overdueTasks }}</div>
              <div class="text-subtitle-1">{{ $t('dashboard.overdueTasks') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts and Progress -->
      <v-row class="mb-6">
        <!-- Completion Progress -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>{{ $t('dashboard.completionProgress') }}</v-card-title>
            <v-card-text>
              <v-progress-linear
                :model-value="completionPercentage"
                color="success"
                height="20"
                striped
              >
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
              <div class="text-center mt-2">
                {{ completedTasks }} / {{ totalTasks }} {{ $t('dashboard.tasksCompleted') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Tasks by Status -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>{{ $t('dashboard.tasksByStatus') }}</v-card-title>
            <v-card-text>
              <div v-for="item in tasksByStatusData" :key="item.label" class="d-flex align-center mb-2">
                <v-icon :color="item.color" class="mr-2">mdi-checkbox-blank-circle</v-icon>
                <span class="flex-grow-1">{{ item.label }}</span>
                <v-chip :color="item.color" variant="outlined" size="small">{{ item.value }}</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Tasks by Priority -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>{{ $t('dashboard.tasksByPriority') }}</v-card-title>
            <v-card-text>
              <div v-for="item in tasksByPriorityData" :key="item.label" class="d-flex align-center mb-2">
                <v-icon :color="item.color" class="mr-2">mdi-flag</v-icon>
                <span class="flex-grow-1">{{ item.label }}</span>
                <v-chip :color="item.color" variant="outlined" size="small">{{ item.value }}</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Tasks -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <span>{{ $t('dashboard.recentTasks') }}</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                to="/tasks"
              >
                {{ $t('dashboard.viewAllTasks') }}
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="recentTasks.length === 0" class="text-center pa-4">
                <v-icon size="64" color="grey-lighten-1">mdi-clipboard-check</v-icon>
                <div class="text-h6 mt-2">{{ $t('tasks.noTasks') }}</div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mt-2"
                  @click="openTaskForm"
                >
                  {{ $t('tasks.createNew') }}
                </v-btn>
              </div>
              <div v-else>
                <TaskCard
                  v-for="task in recentTasks"
                  :key="task.id"
                  :task="task"
                  @edit="openTaskForm"
                  @delete="onTaskDeleted"
                  @status-change="onTaskStatusChanged"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Task Form Dialog -->
    <TaskForm
      :task="editingTask"
      :show-dialog="showTaskForm"
      @close="closeTaskForm"
      @saved="onTaskSaved"
    />
  </v-container>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
