/**
 * Require filesystem and path modules, Sequelize ORM,
 * app config, and empty db object to contain models.
 * This initializes the modules needed to load models.
 */
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config/config')
const db = {}

/**
 * Initialize a Sequelize instance by passing in the database name,
 * username, password, and options from the config file.
 */
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

/**
 * Loop through all files in models directory except index.js.
 * Require each model file, initialize model with sequelize and datatypes,
 * and add to db object with model name as key.
*/
fs
  .readdirSync(__dirname)
  .filter(file =>
    file !== 'index.js'
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize)
    db[model.name] = model
  })

/**
 * Set up model associations
 * This runs the associate method on each model if it exists
 */
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

/**
 * Expose sequelize instance and Sequelize constructor
 * on the db object so models can use them.
 */
db.sequelize = sequelize
db.Sequelize = Sequelize

/**
 * Export the db object containing all models.
 * This allows other parts of the app to import models via this db object.
 */
module.exports = db
