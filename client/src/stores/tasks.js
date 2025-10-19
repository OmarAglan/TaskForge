import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import TaskService from '@/services/TaskService'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref([])
  const currentTask = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })
  const filters = ref({
    status: null,
    priority: null,
    projectId: null
  })

  // Getters
  const tasksByStatus = computed(() => {
    const grouped = {
      todo: [],
      in_progress: [],
      completed: [],
      blocked: []
    }
    
    tasks.value.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })
    
    return grouped
  })

  const tasksByPriority = computed(() => {
    const grouped = {
      low: [],
      medium: [],
      high: [],
      urgent: []
    }
    
    tasks.value.forEach(task => {
      if (grouped[task.priority]) {
        grouped[task.priority].push(task)
      }
    })
    
    return grouped
  })

  const overdueTasks = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate < today
    })
  })

  const upcomingTasks = computed(() => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    return tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate <= nextWeek
    })
  })

  // Actions
  async function fetchTasks(page = 1, newFilters = {}) {
    loading.value = true
    error.value = null
    
    try {
      // Update filters if provided
      if (Object.keys(newFilters).length > 0) {
        filters.value = { ...filters.value, ...newFilters }
      }
      
      const params = {
        page,
        limit: pagination.value.limit,
        ...filters.value
      }
      
      // Remove null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === null) {
          delete params[key]
        }
      })
      
      const response = await TaskService.getTasks(params)
      
      if (response.data.success) {
        tasks.value = response.data.data.tasks
        pagination.value = response.data.data.pagination
      } else {
        error.value = response.data.error?.message || 'Failed to fetch tasks'
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      error.value = err.response?.data?.error?.message || 'Server error while fetching tasks'
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await TaskService.getTask(id)
      
      if (response.data.success) {
        currentTask.value = response.data.data.task
        return response.data.data.task
      } else {
        error.value = response.data.error?.message || 'Failed to fetch task'
        return null
      }
    } catch (err) {
      console.error('Error fetching task:', err)
      error.value = err.response?.data?.error?.message || 'Server error while fetching task'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await TaskService.createTask(taskData)
      
      if (response.data.success) {
        // Add the new task to the beginning of the tasks array
        tasks.value.unshift(response.data.data.task)
        return response.data.data.task
      } else {
        error.value = response.data.error?.message || 'Failed to create task'
        return null
      }
    } catch (err) {
      console.error('Error creating task:', err)
      error.value = err.response?.data?.error?.message || 'Server error while creating task'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id, taskData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await TaskService.updateTask(id, taskData)
      
      if (response.data.success) {
        // Update the task in the tasks array
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data.data.task
        }
        
        // Update currentTask if it's the same task
        if (currentTask.value && currentTask.value.id === id) {
          currentTask.value = response.data.data.task
        }
        
        return response.data.data.task
      } else {
        error.value = response.data.error?.message || 'Failed to update task'
        return null
      }
    } catch (err) {
      console.error('Error updating task:', err)
      error.value = err.response?.data?.error?.message || 'Server error while updating task'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await TaskService.deleteTask(id)
      
      if (response.data.success) {
        // Remove the task from the tasks array
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value.splice(index, 1)
        }
        
        // Clear currentTask if it's the same task
        if (currentTask.value && currentTask.value.id === id) {
          currentTask.value = null
        }
        
        return true
      } else {
        error.value = response.data.error?.message || 'Failed to delete task'
        return false
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      error.value = err.response?.data?.error?.message || 'Server error while deleting task'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(id, status) {
    loading.value = true
    error.value = null
    
    try {
      const response = await TaskService.updateTaskStatus(id, status)
      
      if (response.data.success) {
        // Update the task in the tasks array
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data.data.task
        }
        
        // Update currentTask if it's the same task
        if (currentTask.value && currentTask.value.id === id) {
          currentTask.value = response.data.data.task
        }
        
        return response.data.data.task
      } else {
        error.value = response.data.error?.message || 'Failed to update task status'
        return null
      }
    } catch (err) {
      console.error('Error updating task status:', err)
      error.value = err.response?.data?.error?.message || 'Server error while updating task status'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      status: null,
      priority: null,
      projectId: null
    }
  }

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    tasksByStatus,
    tasksByPriority,
    overdueTasks,
    upcomingTasks,
    
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    clearError,
    setFilters,
    clearFilters
  }
})