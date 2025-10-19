/**
 * Require statements to import the controllers and policies modules.
 * These will be used for handling API requests in the routes.
 */
const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const TaskController = require('./controllers/TaskController')
const TaskControllerPolicy = require('./policies/TaskControllerPolicy')
const ProjectController = require('./controllers/ProjectController')
const ProjectControllerPolicy = require('./policies/ProjectControllerPolicy')
const authenticationMiddleware = require('./middleware/authentication')

/**
 * Defines the API routes for the Express app.
 * - GET / - Sends a simple hello world message.
 * - POST /register - Handles user registration. Uses AuthenticationControllerPolicy middleware and AuthenticationController handler.
 * - POST /login - Handles user authentication.
 * - GET /status - Sends a message with the server port number.
 *
 * Task Routes (protected):
 * - GET /tasks - Get all tasks for the authenticated user
 * - GET /tasks/:id - Get a specific task
 * - POST /tasks - Create a new task
 * - PUT /tasks/:id - Update a task
 * - DELETE /tasks/:id - Delete a task
 * - PATCH /tasks/:id/status - Update task status only
 *
 * Project Routes (protected):
 * - GET /projects - Get all projects for the authenticated user
 * - GET /projects/:id - Get a specific project
 * - POST /projects - Create a new project
 * - PUT /projects/:id - Update a project
 * - DELETE /projects/:id - Delete a project
 * - GET /projects/:id/tasks - Get all tasks for a specific project
 */
module.exports = (app) => {
  // Public routes
  app.get('/', (req, res) => {
    res.send({
      message: 'hello world, This is the server index page'
    })
  })

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login', AuthenticationController.login)

  app.get('/status', (req, res) => {
    res.send({
      message: 'server is running on port: 8081!'
    })
  })

  // Protected routes (require authentication)
  
  // Task routes
  app.get('/tasks',
    authenticationMiddleware,
    TaskControllerPolicy.getTasks,
    TaskController.getTasks
  )
  
  app.get('/tasks/:id',
    authenticationMiddleware,
    TaskController.getTask
  )
  
  app.post('/tasks',
    authenticationMiddleware,
    TaskControllerPolicy.createTask,
    TaskController.createTask
  )
  
  app.put('/tasks/:id',
    authenticationMiddleware,
    TaskControllerPolicy.updateTask,
    TaskController.updateTask
  )
  
  app.delete('/tasks/:id',
    authenticationMiddleware,
    TaskController.deleteTask
  )
  
  app.patch('/tasks/:id/status',
    authenticationMiddleware,
    TaskControllerPolicy.updateTaskStatus,
    TaskController.updateTaskStatus
  )
  
  // Project routes
  app.get('/projects',
    authenticationMiddleware,
    ProjectController.getProjects
  )
  
  app.get('/projects/:id',
    authenticationMiddleware,
    ProjectController.getProject
  )
  
  app.post('/projects',
    authenticationMiddleware,
    ProjectControllerPolicy.createProject,
    ProjectController.createProject
  )
  
  app.put('/projects/:id',
    authenticationMiddleware,
    ProjectControllerPolicy.updateProject,
    ProjectController.updateProject
  )
  
  app.delete('/projects/:id',
    authenticationMiddleware,
    ProjectController.deleteProject
  )
  
  app.get('/projects/:id/tasks',
    authenticationMiddleware,
    ProjectControllerPolicy.getProjectTasks,
    ProjectController.getProjectTasks
  )
}
