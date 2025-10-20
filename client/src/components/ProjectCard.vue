<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'click'])

// Computed properties
const totalTasks = computed(() => {
  if (!props.project.taskStats) return 0
  return props.project.taskStats.total || 0
})

const taskStats = computed(() => {
  if (!props.project.taskStats) {
    return {
      todo: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0
    }
  }
  return props.project.taskStats
})

const completionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((taskStats.value.completed / totalTasks.value) * 100)
})

// Methods
function editProject() {
  emit('edit', props.project)
}

function deleteProject() {
  emit('delete', props.project)
}

function viewProject() {
  emit('click', props.project)
}
</script>

<template>
  <v-card
    class="project-card"
    elevation="2"
    @click="viewProject"
    :style="{ borderLeft: `4px solid ${project.color}` }"
  >
    <v-card-title class="d-flex align-center pa-4">
      <v-icon
        :color="project.color"
        icon="mdi-folder"
        size="large"
        class="mr-3"
      ></v-icon>
      <div class="flex-grow-1">
        <div class="text-h6">{{ project.name }}</div>
        <div v-if="totalTasks > 0" class="text-caption text-medium-emphasis">
          {{ totalTasks }} {{ totalTasks === 1 ? $t('tasks.task') : $t('tasks.tasks') }}
        </div>
      </div>
      
      <!-- Actions menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            @click.stop
          ></v-btn>
        </template>
        <v-list>
          <v-list-item @click.stop="editProject">
            <template v-slot:prepend>
              <v-icon icon="mdi-pencil"></v-icon>
            </template>
            <v-list-item-title>{{ $t('common.edit') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click.stop="deleteProject">
            <template v-slot:prepend>
              <v-icon icon="mdi-delete" color="error"></v-icon>
            </template>
            <v-list-item-title>{{ $t('common.delete') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-text class="pa-4 pt-0">
      <!-- Description -->
      <p v-if="project.description" class="text-body-2 mb-4">
        {{ project.description }}
      </p>
      <p v-else class="text-body-2 text-medium-emphasis mb-4">
        {{ $t('projects.noDescription') }}
      </p>

      <!-- Progress Bar -->
      <div v-if="totalTasks > 0" class="mb-3">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption">{{ $t('projects.progress') }}</span>
          <span class="text-caption font-weight-bold">{{ completionPercentage }}%</span>
        </div>
        <v-progress-linear
          :model-value="completionPercentage"
          :color="project.color"
          height="8"
          rounded
        ></v-progress-linear>
      </div>

      <!-- Task Statistics -->
      <div v-if="totalTasks > 0" class="task-stats">
        <v-chip
          v-if="taskStats.todo > 0"
          size="small"
          variant="outlined"
          color="grey"
          class="mr-2 mb-2"
        >
          <v-icon start size="small">mdi-circle-outline</v-icon>
          {{ taskStats.todo }} {{ $t('tasks.status.todo') }}
        </v-chip>
        
        <v-chip
          v-if="taskStats.in_progress > 0"
          size="small"
          variant="outlined"
          color="blue"
          class="mr-2 mb-2"
        >
          <v-icon start size="small">mdi-clock-outline</v-icon>
          {{ taskStats.in_progress }} {{ $t('tasks.status.in_progress') }}
        </v-chip>
        
        <v-chip
          v-if="taskStats.completed > 0"
          size="small"
          variant="outlined"
          color="green"
          class="mr-2 mb-2"
        >
          <v-icon start size="small">mdi-check-circle-outline</v-icon>
          {{ taskStats.completed }} {{ $t('tasks.status.completed') }}
        </v-chip>
        
        <v-chip
          v-if="taskStats.blocked > 0"
          size="small"
          variant="outlined"
          color="red"
          class="mr-2 mb-2"
        >
          <v-icon start size="small">mdi-alert-circle-outline</v-icon>
          {{ taskStats.blocked }} {{ $t('tasks.status.blocked') }}
        </v-chip>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-4">
        <v-icon size="48" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
        <div class="text-body-2 text-medium-emphasis mt-2">
          {{ $t('projects.noTasksInProject') }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.project-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.task-stats {
  display: flex;
  flex-wrap: wrap;
}
</style>