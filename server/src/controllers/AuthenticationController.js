/**
 * Imports the User model from the models module
*/
const { User } = require('../models')
const bcrypt = require('bcrypt')

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
      const { username, password } = req.body;
      const salt = await bcrypt.genSalt(10); // Generate salt
      const hashedPassword = await bcrypt.hash(password, salt); // Hash password

      const user = await User.create({ // Create user with hashed password
        username: username,
        password: hashedPassword
      })
      // Respond without sending the password back
      res.status(200).send({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).send({
        error: 'This Username is already in use.'
      })
    }
  }
}
