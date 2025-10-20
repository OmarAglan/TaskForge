<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import { useI18n } from 'vue-i18n'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const { t } = useI18n()

// State
const loading = ref(false)
const showTaskForm = ref(false)
const editingTask = ref(null)
const search = ref('')
const searchDebounceTimer = ref(null)

// Filters
const selectedStatus = ref(null)
const selectedPriority = ref(null)
const selectedProject = ref(null)

// Sorting
const sortBy = ref('dueDate')
const sortDirection = ref('asc')

// View mode
const viewMode = ref('grid') // 'grid' or 'list'

// Computed properties
const statusOptions = computed(() => [
  { title: t('common.all'), value: null },
  { title: t('tasks.status.todo'), value: 'todo' },
  { title: t('tasks.status.in_progress'), value: 'in_progress' },
  { title: t('tasks.status.completed'), value: 'completed' },
  { title: t('tasks.status.blocked'), value: 'blocked' }
])

const priorityOptions = computed(() => [
  { title: t('common.all'), value: null },
  { title: t('tasks.priority.low'), value: 'low' },
  { title: t('tasks.priority.medium'), value: 'medium' },
  { title: t('tasks.priority.high'), value: 'high' },
  { title: t('tasks.priority.urgent'), value: 'urgent' }
])

const projectOptions = computed(() => {
  const options = [{ title: t('common.all'), value: null }]
  projectStore.projects.forEach(project => {
    options.push({
      title: project.name,
      value: project.id
    })
  })
  return options
})

const sortOptions = computed(() => [
  { title: t('tasks.sort.dueDate'), value: 'dueDate' },
  { title: t('tasks.sort.priority'), value: 'priority' },
  { title: t('tasks.sort.createdAt'), value: 'createdAt' },
  { title: t('tasks.sort.title'), value: 'title' }
])

// Filtered and sorted tasks
const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks]
  
  // Apply search filter
  if (search.value.trim()) {
    const searchLower = search.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower))
    )
  }
  
  // Apply status filter
  if (selectedStatus.value) {
    tasks = tasks.filter(task => task.status === selectedStatus.value)
  }
  
  // Apply priority filter
  if (selectedPriority.value) {
    tasks = tasks.filter(task => task.priority === selectedPriority.value)
  }
  
  // Apply project filter
  if (selectedProject.value) {
    tasks = tasks.filter(task => task.projectId === selectedProject.value)
  }
  
  // Apply sorting
  tasks.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31')
        bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31')
        break
      case 'priority': {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
        break
      }
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return tasks
})

const taskCount = computed(() => filteredTasks.value.length)
const hasFilters = computed(() => {
  return search.value || selectedStatus.value || selectedPriority.value || selectedProject.value
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
  closeTaskForm()
}

function onTaskDeleted() {
  // Task is already removed from store
}

function onTaskStatusChanged() {
  // Task is already updated in store
}

function clearFilters() {
  search.value = ''
  selectedStatus.value = null
  selectedPriority.value = null
  selectedProject.value = null
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

// Debounced search
watch(search, () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    // Search is applied via computed property
    // This timeout just prevents excessive re-computation
  }, 300)
})

// Load data on mount
onMounted(() => {
  loadData()
})
</script>

<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 mb-1">{{ $t('tasks.title') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ taskCount }} {{ taskCount === 1 ? $t('tasks.task') : $t('tasks.tasks') }}
        </p>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        @click="openTaskForm()"
      >
        {{ $t('tasks.createNew') }}
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row align="center">
          <!-- Search -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              :label="$t('tasks.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              :placeholder="$t('tasks.searchPlaceholder')"
            ></v-text-field>
          </v-col>

          <!-- Status Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              :label="$t('tasks.status.label')"
              variant="outlined"
              density="comfortable"
              hide-details
            ></v-select>
          </v-col>

          <!-- Priority Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedPriority"
              :items="priorityOptions"
              :label="$t('tasks.priority.label')"
              variant="outlined"
              density="comfortable"
              hide-details
            ></v-select>
          </v-col>

          <!-- Project Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedProject"
              :items="projectOptions"
              :label="$t('tasks.project')"
              variant="outlined"
              density="comfortable"
              hide-details
              :loading="projectStore.loading"
            ></v-select>
          </v-col>

          <!-- Sort -->
          <v-col cols="12" sm="6" md="2">
            <div class="d-flex align-center ga-2">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                :label="$t('tasks.sortBy')"
                variant="outlined"
                density="comfortable"
                hide-details
                class="flex-grow-1"
              ></v-select>
              <v-btn
                :icon="sortDirection === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
                variant="outlined"
                @click="toggleSortDirection"
                :title="sortDirection === 'asc' ? $t('tasks.ascending') : $t('tasks.descending')"
              ></v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Filter Actions -->
        <v-row v-if="hasFilters" class="mt-2">
          <v-col>
            <v-chip
              closable
              @click:close="clearFilters"
              color="primary"
              variant="outlined"
            >
              <v-icon start>mdi-filter-remove</v-icon>
              {{ $t('tasks.clearFilters') }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- View Mode Toggle -->
    <div class="d-flex justify-end mb-4">
      <v-btn-toggle
        v-model="viewMode"
        mandatory
        variant="outlined"
        divided
      >
        <v-btn value="grid" icon="mdi-view-grid"></v-btn>
        <v-btn value="list" icon="mdi-view-list"></v-btn>
      </v-btn-toggle>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="filteredTasks.length === 0" class="pa-8" elevation="0">
      <div class="text-center">
        <v-icon size="120" color="grey-lighten-1">
          {{ hasFilters ? 'mdi-filter-remove-outline' : 'mdi-clipboard-check-outline' }}
        </v-icon>
        <h2 class="text-h5 mt-4 mb-2">
          {{ hasFilters ? $t('tasks.noTasksFiltered') : $t('tasks.noTasks') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ hasFilters ? $t('tasks.noTasksFilteredDesc') : $t('tasks.noTasksDesc') }}
        </p>
        <v-btn
          v-if="hasFilters"
          color="primary"
          variant="outlined"
          @click="clearFilters"
        >
          {{ $t('tasks.clearFilters') }}
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openTaskForm()"
        >
          {{ $t('tasks.createFirst') }}
        </v-btn>
      </div>
    </v-card>

    <!-- Tasks Grid View -->
    <v-row v-else-if="viewMode === 'grid'">
      <v-col
        v-for="task in filteredTasks"
        :key="task.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <TaskCard
          :task="task"
          @edit="openTaskForm"
          @delete="onTaskDeleted"
          @status-change="onTaskStatusChanged"
        />
      </v-col>
    </v-row>

    <!-- Tasks List View -->
    <div v-else>
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @edit="openTaskForm"
        @delete="onTaskDeleted"
        @status-change="onTaskStatusChanged"
      />
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