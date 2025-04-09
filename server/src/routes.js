/**
 * Require statements to import the AuthenticationController and
 * AuthenticationControllerPolicy modules. These will be used for
 * handling user authentication in the routes.
*/
const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')

/**
 * Defines the API routes for the Express app.
 * - GET / - Sends a simple hello world message.
 * - POST /register - Handles user registration. Uses AuthenticationControllerPolicy middleware and AuthenticationController handler.
 * - GET /status - Sends a message with the server port number.
 */
module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send({
      message: 'hello world, This is the server index page'
    })
  })

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.get('/login',
    )

  app.get('/status', (req, res) => {
    res.send({
      message: 'server is running on port: 8081!'
    })
  })
}
