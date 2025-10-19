import Api from './Api'

export default {
  /**
   * Get all projects for the authenticated user
   * @returns {Promise} Axios promise with project data
   */
  getProjects() {
    return Api().get('/projects')
  },

  /**
   * Get a single project by ID
   * @param {number} id - Project ID
   * @returns {Promise} Axios promise with project data
   */
  getProject(id) {
    return Api().get(`/projects/${id}`)
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data (name, description, color)
   * @returns {Promise} Axios promise with created project data
   */
  createProject(projectData) {
    return Api().post('/projects', projectData)
  },

  /**
   * Update an existing project
   * @param {number} id - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} Axios promise with updated project data
   */
  updateProject(id, projectData) {
    return Api().put(`/projects/${id}`, projectData)
  },

  /**
   * Delete a project
   * @param {number} id - Project ID
   * @returns {Promise} Axios promise
   */
  deleteProject(id) {
    return Api().delete(`/projects/${id}`)
  },

  /**
   * Get all tasks for a specific project
   * @param {number} id - Project ID
   * @param {Object} filters - Optional filters (status, priority, page, limit)
   * @returns {Promise} Axios promise with task data
   */
  getProjectTasks(id, filters = {}) {
    return Api().get(`/projects/${id}/tasks`, { params: filters })
  }
}