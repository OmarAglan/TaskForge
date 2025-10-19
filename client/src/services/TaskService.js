import Api from './Api'

export default {
  /**
   * Get all tasks for the authenticated user
   * @param {Object} filters - Optional filters (status, priority, projectId, page, limit)
   * @returns {Promise} Axios promise with task data
   */
  getTasks(filters = {}) {
    return Api().get('/tasks', { params: filters })
  },

  /**
   * Get a single task by ID
   * @param {number} id - Task ID
   * @returns {Promise} Axios promise with task data
   */
  getTask(id) {
    return Api().get(`/tasks/${id}`)
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data (title, description, status, priority, dueDate, projectId)
   * @returns {Promise} Axios promise with created task data
   */
  createTask(taskData) {
    return Api().post('/tasks', taskData)
  },

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} Axios promise with updated task data
   */
  updateTask(id, taskData) {
    return Api().put(`/tasks/${id}`, taskData)
  },

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise} Axios promise
   */
  deleteTask(id) {
    return Api().delete(`/tasks/${id}`)
  },

  /**
   * Update only the status of a task
   * @param {number} id - Task ID
   * @param {string} status - New status (todo, in_progress, completed, blocked)
   * @returns {Promise} Axios promise with updated task data
   */
  updateTaskStatus(id, status) {
    return Api().patch(`/tasks/${id}/status`, { status })
  }
}