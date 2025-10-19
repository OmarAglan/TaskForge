const { Task, Project, User } = require('../models')

/**
 * Task Controller - Handles all task-related operations
 */
module.exports = {
  /**
   * Get all tasks for the authenticated user
   * Supports filtering by status, priority, and project
   */
  async getTasks(req, res) {
    try {
      const { status, priority, projectId, page = 1, limit = 10 } = req.query
      const userId = req.user.userId // From JWT middleware
      
      // Build filter object
      const where = { userId }
      
      if (status) where.status = status
      if (priority) where.priority = priority
      if (projectId) where.projectId = projectId
      
      // Pagination options
      const offset = (page - 1) * limit
      
      // Find tasks with optional filters
      const { count, rows: tasks } = await Task.findAndCountAll({
        where,
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'color']
          }
        ],
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
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching tasks'
        }
      })
    }
  },

  /**
   * Get a single task by ID
   */
  async getTask(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      
      const task = await Task.findOne({
        where: { id, userId },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'color']
          }
        ]
      })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found'
          }
        })
      }
      
      res.status(200).json({
        success: true,
        data: { task }
      })
    } catch (error) {
      console.error('Error fetching task:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while fetching task'
        }
      })
    }
  },

  /**
   * Create a new task
   */
  async createTask(req, res) {
    try {
      const userId = req.user.userId
      const { title, description, status = 'todo', priority = 'medium', dueDate, projectId } = req.body
      
      // Validate that the project belongs to the user if projectId is provided
      if (projectId) {
        const project = await Project.findOne({
          where: { id: projectId, userId }
        })
        
        if (!project) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid project ID'
            }
          })
        }
      }
      
      const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        userId,
        projectId
      })
      
      // Fetch the created task with project details
      const createdTask = await Task.findByPk(task.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'color']
          }
        ]
      })
      
      res.status(201).json({
        success: true,
        data: { task: createdTask }
      })
    } catch (error) {
      console.error('Error creating task:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while creating task'
        }
      })
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { title, description, status, priority, dueDate, projectId } = req.body
      
      // Find the task
      const task = await Task.findOne({ where: { id, userId } })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found'
          }
        })
      }
      
      // Validate that the project belongs to the user if projectId is provided
      if (projectId && projectId !== task.projectId) {
        const project = await Project.findOne({
          where: { id: projectId, userId }
        })
        
        if (!project) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid project ID'
            }
          })
        }
      }
      
      // Update the task
      await task.update({
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        status: status || task.status,
        priority: priority || task.priority,
        dueDate: dueDate !== undefined ? dueDate : task.dueDate,
        projectId: projectId !== undefined ? projectId : task.projectId
      })
      
      // Fetch the updated task with project details
      const updatedTask = await Task.findByPk(task.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'color']
          }
        ]
      })
      
      res.status(200).json({
        success: true,
        data: { task: updatedTask }
      })
    } catch (error) {
      console.error('Error updating task:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while updating task'
        }
      })
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      
      const task = await Task.findOne({ where: { id, userId } })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found'
          }
        })
      }
      
      await task.destroy()
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while deleting task'
        }
      })
    }
  },

  /**
   * Update only the status of a task
   */
  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      const userId = req.user.userId
      
      if (!status || !['todo', 'in_progress', 'completed', 'blocked'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid status value'
          }
        })
      }
      
      const task = await Task.findOne({ where: { id, userId } })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found'
          }
        })
      }
      
      await task.update({ status })
      
      // Fetch the updated task with project details
      const updatedTask = await Task.findByPk(task.id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'color']
          }
        ]
      })
      
      res.status(200).json({
        success: true,
        data: { task: updatedTask }
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error while updating task status'
        }
      })
    }
  }
}