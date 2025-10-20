const { Model, DataTypes } = require('sequelize')

/**
 * Defines the User model.
 *
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} - The User model
 */
module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.Task, {
        foreignKey: 'userId',
        as: 'tasks'
      })
      
      User.hasMany(models.Project, {
        foreignKey: 'userId',
        as: 'projects'
      })
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  })

  return User
}
