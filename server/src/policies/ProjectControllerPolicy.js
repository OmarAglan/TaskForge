const Joi = require('joi')

module.exports = {
  // Policy for creating a project
  createProject(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(1).max(255).required().messages({
        'string.empty': 'Project name is required',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name cannot exceed 255 characters',
        'any.required': 'Project name is required'
      }),
      description: Joi.string().max(1000).optional().allow('').messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
      color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
        'string.pattern.base': 'Color must be a valid hex color code (e.g., #3498db)'
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

  // Policy for updating a project
  updateProject(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().min(1).max(255).optional().messages({
        'string.empty': 'Project name cannot be empty',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name cannot exceed 255 characters'
      }),
      description: Joi.string().max(1000).optional().allow('').messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
      color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
        'string.pattern.base': 'Color must be a valid hex color code (e.g., #3498db)'
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

  // Policy for querying project tasks
  getProjectTasks(req, res, next) {
    const schema = Joi.object({
      status: Joi.string().valid('todo', 'in_progress', 'completed', 'blocked').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
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