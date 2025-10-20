<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useI18n } from 'vue-i18n'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectForm from '@/components/ProjectForm.vue'

const projectStore = useProjectStore()
const { t } = useI18n()

// State
const loading = ref(false)
const showProjectForm = ref(false)
const editingProject = ref(null)
const showDeleteDialog = ref(false)
const projectToDelete = ref(null)
const deleteError = ref('')

// View mode
const viewMode = ref('grid') // 'grid' or 'list'

// Search
const search = ref('')

// Computed properties
const filteredProjects = computed(() => {
  let projects = [...projectStore.projects]
  
  // Apply search filter
  if (search.value.trim()) {
    const searchLower = search.value.toLowerCase()
    projects = projects.filter(project => 
      project.name.toLowerCase().includes(searchLower) ||
      (project.description && project.description.toLowerCase().includes(searchLower))
    )
  }
  
  return projects
})

const projectCount = computed(() => filteredProjects.value.length)

// Methods
async function loadData() {
  loading.value = true
  try {
    await projectStore.fetchProjects()
  } finally {
    loading.value = false
  }
}

function openProjectForm(project = null) {
  editingProject.value = project
  showProjectForm.value = true
}

function closeProjectForm() {
  showProjectForm.value = false
  editingProject.value = null
}

function onProjectSaved() {
  closeProjectForm()
}

function handleProjectClick(project) {
  // Navigate to project detail view (will be implemented later)
  // For now, just edit the project
  openProjectForm(project)
}

function confirmDelete(project) {
  projectToDelete.value = project
  deleteError.value = ''
  showDeleteDialog.value = true
}

async function deleteProject() {
  if (!projectToDelete.value) return
  
  const success = await projectStore.deleteProject(projectToDelete.value.id)
  
  if (success) {
    showDeleteDialog.value = false
    projectToDelete.value = null
    deleteError.value = ''
  } else {
    // Show error from store
    deleteError.value = projectStore.error || t('projects.deleteError')
  }
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  projectToDelete.value = null
  deleteError.value = ''
}

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
        <h1 class="text-h4 mb-1">{{ $t('projects.title') }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ projectCount }} {{ projectCount === 1 ? $t('projects.project') : $t('projects.projects') }}
        </p>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        @click="openProjectForm()"
      >
        {{ $t('projects.createNew') }}
      </v-btn>
    </div>

    <!-- Search and View Controls -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row align="center">
          <!-- Search -->
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              :label="$t('projects.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              :placeholder="$t('projects.searchPlaceholder')"
            ></v-text-field>
          </v-col>

          <!-- View Mode Toggle -->
          <v-col cols="12" md="4" class="d-flex justify-end">
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              variant="outlined"
              divided
            >
              <v-btn value="grid" icon="mdi-view-grid">
                <v-icon>mdi-view-grid</v-icon>
                <v-tooltip activator="parent" location="top">
                  {{ $t('projects.gridView') }}
                </v-tooltip>
              </v-btn>
              <v-btn value="list" icon="mdi-view-list">
                <v-icon>mdi-view-list</v-icon>
                <v-tooltip activator="parent" location="top">
                  {{ $t('projects.listView') }}
                </v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="filteredProjects.length === 0" class="pa-8" elevation="0">
      <div class="text-center">
        <v-icon size="120" color="grey-lighten-1">
          {{ search ? 'mdi-folder-search-outline' : 'mdi-folder-open-outline' }}
        </v-icon>
        <h2 class="text-h5 mt-4 mb-2">
          {{ search ? $t('projects.noProjectsFiltered') : $t('projects.noProjects') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ search ? $t('projects.noProjectsFilteredDesc') : $t('projects.noProjectsDesc') }}
        </p>
        <v-btn
          v-if="search"
          color="primary"
          variant="outlined"
          @click="search = ''"
        >
          {{ $t('projects.clearSearch') }}
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openProjectForm()"
        >
          {{ $t('projects.createFirst') }}
        </v-btn>
      </div>
    </v-card>

    <!-- Projects Grid View -->
    <v-row v-else-if="viewMode === 'grid'">
      <v-col
        v-for="project in filteredProjects"
        :key="project.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ProjectCard
          :project="project"
          @click="handleProjectClick"
          @edit="openProjectForm"
          @delete="confirmDelete"
        />
      </v-col>
    </v-row>

    <!-- Projects List View -->
    <div v-else class="project-list">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="handleProjectClick"
        @edit="openProjectForm"
        @delete="confirmDelete"
        class="mb-4"
      />
    </div>

    <!-- Project Form Dialog -->
    <ProjectForm
      :project="editingProject"
      :show-dialog="showProjectForm"
      @close="closeProjectForm"
      @saved="onProjectSaved"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('projects.deleteConfirm') }}
        </v-card-title>
        <v-card-text>
          <p class="mb-2">
            {{ $t('projects.deleteConfirmMessage', { name: projectToDelete?.name }) }}
          </p>
          <v-alert
            v-if="deleteError"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ deleteError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeDeleteDialog">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteProject">
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
}
</style>