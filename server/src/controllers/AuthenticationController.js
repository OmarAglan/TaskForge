/**
 * Imports the User model from the models module
 */
const { User } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Object} The new user object.
 */
module.exports = {
  async register (req, res) {
    try {
      const { username, password } = req.body
      const salt = await bcrypt.genSalt(10) // Generate salt
      const hashedPassword = await bcrypt.hash(password, salt) // Hash password

      const user = await User.create({ // Create user with hashed password
        username,
        password: hashedPassword
      })
      // Respond without sending the password back
      res.status(200).send({ id: user.id, username: user.username })
    } catch (error) {
      res.status(400).send({
        error: 'This Username is already in use.'
      })
    }
  },

  /**
   * Logs in a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   *
   * @returns {Object} JWT token and user data.
   */
  async login (req, res) {
    try {
      const { username, password } = req.body
      
      // Find user by username
      const user = await User.findOne({ where: { username } })
      
      if (!user) {
        return res.status(401).send({
          error: 'Invalid username or password'
        })
      }
      
      // Compare provided password with stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        return res.status(401).send({
          error: 'Invalid username or password'
        })
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        config.authentication.jwtSecret,
        { expiresIn: config.authentication.jwtExpiresIn }
      )
      
      // Return token and user data (excluding password)
      res.status(200).send({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username
          }
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).send({
        error: 'Server error during login'
      })
    }
  }
}
