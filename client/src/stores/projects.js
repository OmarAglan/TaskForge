import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ProjectService from '@/services/ProjectService'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const projectOptions = computed(() => {
    return projects.value.map(project => ({
      title: project.name,
      value: project.id,
      color: project.color
    }))
  })

  const projectById = computed(() => {
    const projectMap = {}
    projects.value.forEach(project => {
      projectMap[project.id] = project
    })
    return projectMap
  })

  // Actions
  async function fetchProjects() {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.getProjects()
      
      if (response.data.success) {
        projects.value = response.data.data.projects
      } else {
        error.value = response.data.error?.message || 'Failed to fetch projects'
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      error.value = err.response?.data?.error?.message || 'Server error while fetching projects'
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.getProject(id)
      
      if (response.data.success) {
        currentProject.value = response.data.data.project
        return response.data.data.project
      } else {
        error.value = response.data.error?.message || 'Failed to fetch project'
        return null
      }
    } catch (err) {
      console.error('Error fetching project:', err)
      error.value = err.response?.data?.error?.message || 'Server error while fetching project'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createProject(projectData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.createProject(projectData)
      
      if (response.data.success) {
        // Add the new project to the beginning of the projects array
        projects.value.unshift(response.data.data.project)
        return response.data.data.project
      } else {
        error.value = response.data.error?.message || 'Failed to create project'
        return null
      }
    } catch (err) {
      console.error('Error creating project:', err)
      error.value = err.response?.data?.error?.message || 'Server error while creating project'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, projectData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.updateProject(id, projectData)
      
      if (response.data.success) {
        // Update the project in the projects array
        const index = projects.value.findIndex(project => project.id === id)
        if (index !== -1) {
          projects.value[index] = response.data.data.project
        }
        
        // Update currentProject if it's the same project
        if (currentProject.value && currentProject.value.id === id) {
          currentProject.value = response.data.data.project
        }
        
        return response.data.data.project
      } else {
        error.value = response.data.error?.message || 'Failed to update project'
        return null
      }
    } catch (err) {
      console.error('Error updating project:', err)
      error.value = err.response?.data?.error?.message || 'Server error while updating project'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.deleteProject(id)
      
      if (response.data.success) {
        // Remove the project from the projects array
        const index = projects.value.findIndex(project => project.id === id)
        if (index !== -1) {
          projects.value.splice(index, 1)
        }
        
        // Clear currentProject if it's the same project
        if (currentProject.value && currentProject.value.id === id) {
          currentProject.value = null
        }
        
        return true
      } else {
        error.value = response.data.error?.message || 'Failed to delete project'
        return false
      }
    } catch (err) {
      console.error('Error deleting project:', err)
      error.value = err.response?.data?.error?.message || 'Server error while deleting project'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchProjectTasks(id, filters = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await ProjectService.getProjectTasks(id, filters)
      
      if (response.data.success) {
        return response.data.data
      } else {
        error.value = response.data.error?.message || 'Failed to fetch project tasks'
        return null
      }
    } catch (err) {
      console.error('Error fetching project tasks:', err)
      error.value = err.response?.data?.error?.message || 'Server error while fetching project tasks'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentProject() {
    currentProject.value = null
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    error,
    
    // Getters
    projectOptions,
    projectById,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectTasks,
    clearError,
    clearCurrentProject
  }
})