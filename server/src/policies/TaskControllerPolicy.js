const Joi = require('joi')

module.exports = {
  // Policy for creating a task
  createTask(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().min(1).max(255).required().messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 255 characters',
        'any.required': 'Title is required'
      }),
      description: Joi.string().max(5000).optional().allow('').messages({
        'string.max': 'Description cannot exceed 5000 characters'
      }),
      status: Joi.string().valid('todo', 'in_progress', 'completed', 'blocked').optional().messages({
        'any.only': 'Status must be one of: todo, in_progress, completed, blocked'
      }),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      }),
      dueDate: Joi.date().iso().optional().allow(null).messages({
        'date.format': 'Due date must be a valid date in ISO format'
      }),
      projectId: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Project ID must be a number',
        'number.integer': 'Project ID must be an integer',
        'number.positive': 'Project ID must be a positive number'
      })
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      })
    }

    next()
  },

  // Policy for updating a task
  updateTask(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().min(1).max(255).optional().messages({
        'string.empty': 'Title cannot be empty',
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 255 characters'
      }),
      description: Joi.string().max(5000).optional().allow('').messages({
        'string.max': 'Description cannot exceed 5000 characters'
      }),
      status: Joi.string().valid('todo', 'in_progress', 'completed', 'blocked').optional().messages({
        'any.only': 'Status must be one of: todo, in_progress, completed, blocked'
      }),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      }),
      dueDate: Joi.date().iso().optional().allow(null).messages({
        'date.format': 'Due date must be a valid date in ISO format'
      }),
      projectId: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Project ID must be a number',
        'number.integer': 'Project ID must be an integer',
        'number.positive': 'Project ID must be a positive number'
      })
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      })
    }

    next()
  },

  // Policy for updating task status
  updateTaskStatus(req, res, next) {
    const schema = Joi.object({
      status: Joi.string().valid('todo', 'in_progress', 'completed', 'blocked').required().messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be one of: todo, in_progress, completed, blocked'
      })
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      })
    }

    next()
  },

  // Policy for querying tasks
  getTasks(req, res, next) {
    const schema = Joi.object({
      status: Joi.string().valid('todo', 'in_progress', 'completed', 'blocked').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      projectId: Joi.number().integer().positive().optional(),
      page: Joi.number().integer().min(1).optional().messages({
        'number.min': 'Page must be at least 1'
      }),
      limit: Joi.number().integer().min(1).max(100).optional().messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
    })

    const { error } = schema.validate(req.query)
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      })
    }

    next()
  }
}