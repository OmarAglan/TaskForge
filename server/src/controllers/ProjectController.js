const { Project, Task } = require('../models')

/**
 * Project Controller - Handles all project-related operations
 */
module.exports = {
  /**
   * Get all projects for the authenticated user
   */
  async getProjects(req, res) {
    try {
      const userId = req.user.userId // From JWT middleware
      
      const projects = await Project.findAll({
        where: { userId },
        include: [
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      })
      
      // Add task count and status breakdown to each project
      const projectsWithStats = projects.map(project => {
        const projectData = project.toJSON()
        
        // Count tasks by status
        const taskStats = {
          total: projectData.tasks.length,
          todo: 0,
          in_progress: 0,
          completed: 0,
          blocked: 0
        }
        
        projectData.tasks.forEach(task => {
          taskStats[task.status]++
        })
        
        // Replace tasks array with stats
        projectData.taskStats = taskStats
        delete projectData.tasks
        
        return projectData
      })
      
      res.status(200).json({
        success: true,
        data: { projects: projectsWithStats }
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching projects'
        }
      })
    }
  },

  /**
   * Get a single project by ID
   */
  async getProject(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      
      const project = await Project.findOne({
        where: { id, userId },
        include: [
          {
            model: Task,
            as: 'tasks',
            order: [
              ['dueDate', 'ASC'],
              ['priority', 'DESC'],
              ['createdAt', 'DESC']
            ]
          }
        ]
      })
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found'
          }
        })
      }
      
      res.status(200).json({
        success: true,
        data: { project }
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching project'
        }
      })
    }
  },

  /**
   * Create a new project
   */
  async createProject(req, res) {
    try {
      const userId = req.user.userId
      const { name, description, color = '#3498db' } = req.body
      
      const project = await Project.create({
        name,
        description,
        color,
        userId
      })
      
      res.status(201).json({
        success: true,
        data: { project }
      })
    } catch (error) {
      console.error('Error creating project:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while creating project'
        }
      })
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { name, description, color } = req.body
      
      const project = await Project.findOne({ where: { id, userId } })
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found'
          }
        })
      }
      
      await project.update({
        name: name || project.name,
        description: description !== undefined ? description : project.description,
        color: color || project.color
      })
      
      res.status(200).json({
        success: true,
        data: { project }
      })
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while updating project'
        }
      })
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      
      const project = await Project.findOne({ where: { id, userId } })
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found'
          }
        })
      }
      
      // Check if project has tasks
      const taskCount = await Task.count({ where: { projectId: id } })
      
      if (taskCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Cannot delete project with existing tasks. Please delete or reassign tasks first.'
          }
        })
      }
      
      await project.destroy()
      
      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while deleting project'
        }
      })
    }
  },

  /**
   * Get all tasks for a specific project
   */
  async getProjectTasks(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { status, priority, page = 1, limit = 10 } = req.query
      
      // Verify project belongs to user
      const project = await Project.findOne({ where: { id, userId } })
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project not found'
          }
        })
      }
      
      // Build filter object
      const where = { projectId: id }
      
      if (status) where.status = status
      if (priority) where.priority = priority
      
      // Pagination options
      const offset = (page - 1) * limit
      
      // Find tasks with optional filters
      const { count, rows: tasks } = await Task.findAndCountAll({
        where,
        order: [
          ['dueDate', 'ASC'],
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit),
        offset
      })
      
      res.status(200).json({
        success: true,
        data: {
          tasks,
          project: {
            id: project.id,
            name: project.name,
            color: project.color
          },
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching project tasks:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching project tasks'
        }
      })
    }
  }
}